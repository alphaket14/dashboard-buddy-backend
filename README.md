
# ReferMe Backend 

## 🚀 Overview
This is the backend for the **ReferMe** project, built using **Node.js, Express.js, and MySQL**

It handles user authentication, business referrals, and financial transactions.


## ⚙️ **Setup & Installation**

### 1️⃣ **Clone the Repository**

```sh
git clone https://github.com/Faulcon-Enterprises/referme-backend.git
cd referme-backend
```

### 2️⃣ **Install Dependencies**

```sh
npm install
```

### 3️⃣ **Set Up Environment Variables**

Create a `.env` file in the project root:


### 4️⃣ **Initialize Sequelize**

```sh
npx sequelize-cli init
```

### 5️⃣ **Run Database Migrations**

```sh
npx sequelize-cli db:migrate
```

### 6️⃣ **Seed the Database (Optional - for development/testing)**

```sh
npx sequelize-cli db:seed:all
```

### 7️⃣ **Start the Server**

```sh
node server.js
```

or (if using Nodemon for auto-restart)

```sh
npm install --save-dev nodemon
npm run dev
```

