import { LAYER_1_CORE_FAQ } from "./layer1_core_faq.js";

export function getKnowledge(layers = ["LAYER_1_CORE_FAQ"]) {
  const allLayers = {
    LAYER_1_CORE_FAQ,
  };

  return layers.map((key) => allLayers[key]).join("\n\n");
}