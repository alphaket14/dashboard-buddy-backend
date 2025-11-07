import Stripe from "stripe";
import User from "../models/user.js";
import Referral from "../models/referral.js";
import EarningHistory from "../models/earningHistory.js";
import BusinessEntity from "../models/businessEntity.js";
import StripeAccount from "../models/stripeAccount.js";
import Payout from "../models/payout.js";
import { Sequelize, Op } from "sequelize";
import moment from "moment";
import { calculateAllFees, calculateTotalWithStripeFee } from "../utils/feeUtils.js";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

class AdminPanelService {
  async getDashboardSummary() {
    const topBpm = await User.findAll({
      attributes: [
        "id",
        "firstName",
        "lastName",
        "profilePictureUrl",
        "totalEarnings",
        [
          Sequelize.literal(`(
            SELECT COUNT(*)
            FROM Referrals AS r
            WHERE r.referrerId = User.id AND r.refereeRegistered = true
          )`),
          "totalBusinessesReferred",
        ],
      ],
      where: {
        status: "active",
      },
      order: [["totalEarnings", "DESC"]],
      limit: 5,
    });
    const bpmPayout = await EarningHistory.findOne({
      attributes: [
        [Sequelize.fn("SUM", Sequelize.col("amount")), "totalBPMPayout"],
      ],
      where: {
        paymentStatus: "paid",
      },
      raw: true,
    });
    const totalBpm = await User.count({
      where: {
        status: "active",
      },
    });
    let resp = {
      totalBpm,
      ...bpmPayout,
      topBpm,
    };

    return {
      success: true,
      message: "Dashboard summary fetched successfully",
      data: resp,
    };
  }
  async getBpmList(page = 1, limit = 10) {
    const offset = (page - 1) * limit;

    const { count, rows } = await User.findAndCountAll({
      attributes: ["id", "firstName", "lastName", "status"],
      limit,
      offset,
      order: [["createdAt", "DESC"]],
    });

    let response = {
      bpmList: rows,
      meta: {
        total: count,
        page,
        limit,
        totalPages: Math.ceil(count / limit),
      },
    };
    return {
      success: true,
      message: "BPM list fetched successfully",
      data: response,
    };
  }
  async getBpmProfile(userId) {
    // 1. Fetch BPM basic info
    const user = await User.findByPk(userId, {
      attributes: ["id", "firstName", "lastName", "createdAt", "totalEarnings"],
    });

    if (!user) {
      throw new Error("BPM user not found");
    }

    // 2. Calculate pending payout
    const pendingPayoutResult = await EarningHistory.findOne({
      attributes: [
        [Sequelize.fn("SUM", Sequelize.col("amount")), "pendingPayout"],
      ],
      where: {
        userId,
        paymentStatus: "pending",
      },
      raw: true,
    });

    const pendingPayout = pendingPayoutResult.pendingPayout || 0;

    // 3. Get total businesses referred + referral link
    const referrals = await Referral.findAll({
      where: { referrerId: userId },
      attributes: ["referralLink"],
    });

    const totalBusinessesReferred = referrals.length;
    const referralLink =
      referrals.length > 0 ? referrals[0].referralLink : null;

    // 4. Get earning history details
    const earningHistories = await EarningHistory.findAll({
      where: { userId, paymentStatus: "paid" },
      attributes: [
        ["serviceDate", "paymentDate"],
        "businessName",
        "serviceName",
        ["amount", "platformFee"],
        ["serviceFee", "serviceCost"],
      ],
      order: [["serviceDate", "DESC"]],
      raw: true,
    });

    // 5. Final structured response
    return {
      success: true,
      message: "BPM profile fetched successfully",
      data: {
        id: user.id,
        firstName: user.firstName,
        lastName: user.lastName,
        createdAt: user.createdAt,
        totalEarnings: user.totalEarnings,
        pendingPayout,
        totalBusinessesReferred,
        referralLink,
        earningHistory: earningHistories,
      },
    };
  }
  async transactionsList(query) {
    const {
      from,
      to,
      filterType,
      page: pageStr = 1,
      limit: limitStr = 10,
    } = query;

    const page = parseInt(pageStr) || 1;
    const limit = parseInt(limitStr) || 10;
    const offset = (page - 1) * limit;

    const hasFrom = !!from;
    const hasTo = !!to;

    if (!hasFrom && hasTo) {
      return {
        success: false,
        message:
          "'to' cannot be used without 'from'. Please provide both dates.",
      };
    }

    let dateFilter = {};

    if (hasFrom && hasTo) {
      dateFilter = {
        [Op.between]: [
          moment(from).startOf("day").toDate(),
          moment(to).endOf("day").toDate(),
        ],
      };
    } else if (filterType) {
      const allowedFilterTypes = [
        "thisweek",
        "thismonth",
        "thisyear",
        "alltime",
      ];
      const type = filterType.toLowerCase();

      if (!allowedFilterTypes.includes(type)) {
        return {
          success: false,
          message: `Invalid filterType '${filterType}'. Allowed values: ${allowedFilterTypes.join(
            ", "
          )}.`,
        };
      }

      switch (type) {
        case "thismonth":
          dateFilter = {
            [Op.between]: [
              moment().startOf("month").toDate(),
              moment().endOf("month").toDate(),
            ],
          };
          break;
        case "thisyear":
          dateFilter = {
            [Op.between]: [
              moment().startOf("year").toDate(),
              moment().endOf("year").toDate(),
            ],
          };
          break;
        case "alltime":
          dateFilter = {
            [Op.ne]: null,
          };
          break;
        case "thisweek":
          dateFilter = {
            [Op.between]: [
              moment().startOf("week").toDate(),
              moment().endOf("week").toDate(),
            ],
          };
          break;
      }
    } else {
      // 👇 Neither from/to nor filterType
      return {
        success: false,
        message:
          "Please provide either 'from' and 'to' dates or a valid 'filterType'.",
      };
    }

    const { count, rows } = await EarningHistory.findAndCountAll({
      where: {
        serviceDate: dateFilter,
      },
      attributes: [
        "serviceDate",
        "businessName",
        "serviceName",
        ["serviceFee", "serviceCost"],
        ["amount", "platformFee"],
        "paymentStatus",
        "paymentAvailableOn",
        "id",
        "transactionType",
      ],
      include: [
        {
          model: User,
          as: "user",
          attributes: ["firstName", "lastName", "payoneerEmail"],
        },
      ],
      order: [["createdAt", "DESC"]],
      offset,
      limit,
      raw: true,
      nest: true,
    });

    const earnings = rows.map((e) => ({
      id: e.id,
      serviceDate: e.serviceDate,
      firstName: e.user?.firstName,
      lastName: e.user?.lastName,
      userType: e.user?.payoneerEmail ? "Payoneer" : "Stripe",
      businessName: e.businessName,
      serviceName: e.serviceName,
      serviceCost: e.serviceCost,
      platformFee: e.platformFee,
      paymentStatus: e.paymentStatus,
      paymentAvailableOn: e.paymentAvailableOn,
      transactionType: e.transactionType
    }));

    return {
      success: true,
      message: "User earning history fetched successfully",
      data: {
        earnings,
        meta: {
          total: count,
          page,
          limit,
          totalPages: Math.ceil(count / limit),
        },
      },
    };
  }
  async getTransactionDetails(transactionId) {
    if (!transactionId) {
      return {
        success: false,
        message: "Transaction ID is required.",
      };
    }
    const transaction = await EarningHistory.findOne({
      where: { id: transactionId },
      attributes: [
        "id",
        "userId",
        "customerFirstName",
        "customerLastName",
        "serviceName",
        "serviceDate",
        "serviceFee",
        "amount",
        "paymentStatus",
        "stripePaymentId",
        "notes",
        "transactionType"
      ],
      include: [
        {
          model: User,
          as: "user",
          attributes: ["firstName", "lastName", "payoneerEmail"],
        },
      ],
    });

    if (!transaction) {
      return {
        success: false,
        message: "Transaction not found",
      };
    }

    // Step 2: Calculate required values
    const serviceFee = parseFloat(transaction.serviceFee || 0);
    const platformFee = parseFloat(transaction.amount || 0);

    const { stripeFee, totalServiceFee, totalServiceCost } = calculateAllFees(
      serviceFee,
      { feeType: "fixed", currentFee: platformFee }
    );

    // Step 3: Format response
    return {
      success: true,
      message: "Transaction details fetched successfully",
      data: {
        transactionId: transaction.id,
        transactionType: transaction.transactionType,
        userFirstName: transaction.user?.firstName,
        userLastName: transaction.user?.lastName,
        userType: transaction.user?.payoneerEmail ? "Payoneer" : "Stripe",
        customerFirstName: transaction.customerFirstName,
        customerLastName: transaction.customerLastName,
        serviceName: transaction.serviceName,
        serviceDate: transaction.serviceDate,
        serviceCost: serviceFee.toFixed(2),
        stripeFee: stripeFee.toFixed(2),
        platformFee: platformFee.toFixed(2),
        totalServiceFee: totalServiceFee.toFixed(2),
        totalServiceCost: totalServiceCost.toFixed(2),
        paymentStatus: transaction.paymentStatus,
        stripePaymentId: transaction.stripePaymentId,
        payoneerEmail: transaction.user?.payoneerEmail || "",
        notes: transaction.notes || "",
      },
    };
  }
  async updateTransactionNotes(transactionId, notes) {
    // ✅ Input validation
    if (!transactionId) {
      return {
        success: false,
        message: "Transaction ID is required.",
      };
    }

    if (typeof notes !== "string" || notes.trim() === "") {
      return {
        success: false,
        message: "Notes must be a non-empty string.",
      };
    }

    // ✅ Fetch the transaction
    const transaction = await EarningHistory.findByPk(transactionId);

    if (!transaction) {
      return {
        success: false,
        message: "Transaction not found.",
      };
    }

    // ✅ Update notes
    transaction.notes = notes;
    await transaction.save();

    return {
      success: true,
      message: "Transaction notes updated successfully.",
    };
  }
  processPayoutByTransactionId = async (transactionId) => {
    const sequelize = EarningHistory.sequelize;
    const transactionDb = await sequelize.transaction();

    try {
      const transaction = await EarningHistory.findOne({
        where: { id: transactionId, paymentStatus: "pending" },
        include: [
          {
            model: User,
            as: "user",
            attributes: [
              "id",
              "firstName",
              "lastName",
              // "walletBalance",
              "totalEarnings",
            ],
            include: [
              {
                model: StripeAccount,
                as: "stripeAccount",
                where: { status: "active" },
              },
            ],
          },
        ],
        transaction: transactionDb,
        lock: transactionDb.LOCK.UPDATE,
      });

      if (!transaction) {
        await transactionDb.rollback();
        return {
          success: false,
          message: "Transaction not found or already processed.",
        };
      }

      const user = transaction.user;
      const stripeAccount = user.stripeAccount;
      const amount = parseFloat(transaction.amount);

      // Stripe transfer (external call, not part of DB transaction)
      let transfer;
      try {
        transfer = await stripe.transfers.create({
          amount: Math.round(amount * 100),
          currency: "usd",
          destination: stripeAccount.accountId,
          description: `Payout for BPMs transaction ID ${transactionId}`,
        });
      } catch (err) {
        await transactionDb.rollback();
        console.error("Payout failed:", err);
        return {
          success: false,
          message: "Stripe payout failed. " + err.message,
        };
      }

      await Payout.create(
        {
          userId: user.id,
          stripePayoutId: transfer.id,
          amount: amount,
          currency: "usd",
          status: "completed",
          stripeAccountId: stripeAccount.accountId,
          description: transfer.description,
          earningId: transaction.id,
        },
        { transaction: transactionDb }
      );

      await user.update(
        {
          // walletBalance: walletBalance - amount,
          totalEarnings: parseFloat(user.totalEarnings || 0) + amount,
        },
        { transaction: transactionDb }
      );

      await transaction.update(
        {
          paymentStatus: "paid",
        },
        { transaction: transactionDb }
      );

      if (transaction.businessEntityId && transaction.userId) {
        const businessEntity = await BusinessEntity.findOne({
          where: {
            id: transaction.businessEntityId,
            referrerId: transaction.userId,
          },
          transaction: transactionDb,
          lock: transactionDb.LOCK.UPDATE,
        });

        if (businessEntity) {
          await businessEntity.update(
            {
              earnings: parseFloat(businessEntity.earnings || 0) + amount,
            },
            { transaction: transactionDb }
          );
        }
      }

      await transactionDb.commit();
      return {
        success: true,
        message: "Payout processed successfully.",
      };
    } catch (err) {
      await transactionDb.rollback();
      console.error("Payout failed:", err);
      return {
        success: false,
        message: "Payout failed. " + err.message,
      };
    }
  };
  async searchUser(nameQuery) {
    if (!nameQuery) {
      return {
        success: false,
        message: "name is required",
      };
    }
    const users = await User.findAll({
      attributes: ["id", "firstName", "lastName", "status"],
      where: {
        [Op.or]: [
          { firstName: { [Op.like]: `%${nameQuery}%` } },
          { lastName: { [Op.like]: `%${nameQuery}%` } },
        ],
      },
      order: [["createdAt", "DESC"]],
    });
    if (!users.length) {
      return { success: true, message: "user not found" };
    }
    return {
      success: true,
      message: "BPM list fetched successfully",
      data: users,
    };
  }
  async searchTransaction({ name }) {
    if (!name || typeof name !== "string" || name.trim() === "") {
      return {
        success: false,
        message: "Search name is required.",
      };
    }
    const searchFilter = {
      [Op.or]: [
        { "$user.firstName$": { [Op.like]: `%${name}%` } },
        { "$user.lastName$": { [Op.like]: `%${name}%` } },
        { businessName: { [Op.like]: `%${name}%` } },
        { serviceName: { [Op.like]: `%${name}%` } },
      ],
    };

    const transactions = await EarningHistory.findAll({
      where: searchFilter,
      attributes: [
        "id",
        "serviceDate",
        "businessName",
        "serviceName",
        ["serviceFee", "serviceCost"],
        ["amount", "platformFee"],
        "paymentStatus",
        "transactionType"
      ],
      include: [
        {
          model: User,
          as: "user",
          attributes: ["firstName", "lastName"],
        },
      ],
      order: [["createdAt", "DESC"]],
      raw: true,
      nest: true,
    });

    const earnings = transactions.map((e) => ({
      id: e.id,
      serviceDate: e.serviceDate,
      firstName: e.user?.firstName,
      lastName: e.user?.lastName,
      businessName: e.businessName,
      serviceName: e.serviceName,
      serviceCost: e.serviceCost,
      platformFee: e.platformFee,
      paymentStatus: e.paymentStatus,
      transactionType: e.transactionType,
    }));

    return {
      success: true,
      message: "Transactions fetched successfully",
      data: earnings,
    };
  }
}
export default AdminPanelService;
