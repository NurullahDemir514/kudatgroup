import http from "k6/http";
import { check, group, sleep } from "k6";
import { Rate, Trend } from "k6/metrics";

const baseUrl = (__ENV.KUDAT_BASE_URL || "http://localhost:3000").replace(
  /\/$/,
  ""
);
const trackingToken = __ENV.KUDAT_TRACKING_TOKEN || "";
const decisionToken = __ENV.KUDAT_DECISION_TOKEN || trackingToken;
const enableWriteTests = __ENV.KUDAT_ENABLE_WRITE_TESTS === "true";
const baseWriteTestOrderId = __ENV.KUDAT_TEST_ORDER_ID || `load-${Date.now()}`;
const writeMaxPerVu = Number(__ENV.KUDAT_WRITE_MAX_PER_VU || 0);

const profile = __ENV.KUDAT_LOAD_PROFILE || "smoke";

const profileOptions = {
  smoke: {
    vus: 3,
    duration: "2m",
  },
  normal: {
    stages: [
      { duration: "2m", target: 20 },
      { duration: "5m", target: 50 },
      { duration: "2m", target: 0 },
    ],
  },
  stress: {
    stages: [
      { duration: "2m", target: 50 },
      { duration: "5m", target: 120 },
      { duration: "5m", target: 200 },
      { duration: "2m", target: 0 },
    ],
  },
  spike: {
    stages: [
      { duration: "30s", target: 200 },
      { duration: "2m", target: 200 },
      { duration: "30s", target: 0 },
    ],
  },
  soak: {
    stages: [
      { duration: "5m", target: 30 },
      { duration: "45m", target: 30 },
      { duration: "5m", target: 0 },
    ],
  },
};

const writeErrorRate = new Rate("write_endpoint_errors");
const trackingTrend = new Trend("tracking_endpoint_duration");
const catalogTrend = new Trend("catalog_endpoint_duration");

export const options = {
  ...(profileOptions[profile] || profileOptions.smoke),
  thresholds: {
    http_req_failed: ["rate<0.01"],
    http_req_duration: ["p(95)<1500", "p(99)<3000"],
    catalog_endpoint_duration: ["p(95)<800"],
    tracking_endpoint_duration: ["p(95)<1500"],
    write_endpoint_errors: ["rate<0.01"],
  },
};

function get(path, tags = {}) {
  return http.get(`${baseUrl}${path}`, {
    tags,
    timeout: "15s",
  });
}

function assertOk(response, label) {
  return check(response, {
    [`${label}: 2xx/3xx`]: (res) => res.status >= 200 && res.status < 400,
  });
}

export default function () {
  group("Public pages", () => {
    assertOk(get("/", { surface: "home" }), "home");
    assertOk(get("/katalog", { surface: "catalog" }), "catalog page");
    assertOk(get("/siparis-onizleme", { surface: "order_preview" }), "order preview");
  });

  group("Catalog APIs", () => {
    const products = get("/api/products", { surface: "catalog_api" });
    catalogTrend.add(products.timings.duration);
    assertOk(products, "products api");

    const tree = get("/api/catalog/tree", { surface: "catalog_api" });
    catalogTrend.add(tree.timings.duration);
    assertOk(tree, "catalog tree api");
  });

  if (trackingToken) {
    group("Tracking API", () => {
      const response = get(`/api/qanta-order-tracking/${trackingToken}`, {
        surface: "tracking_api",
      });
      trackingTrend.add(response.timings.duration);
      assertOk(response, "tracking api");
    });
  }

  if (enableWriteTests) {
    group("Write endpoints", () => {
      if (writeMaxPerVu > 0 && __ITER >= writeMaxPerVu) {
        return;
      }

      const writeTestOrderId = `${baseWriteTestOrderId}-vu${__VU}-it${__ITER}`;
      const orderResponse = http.post(
        `${baseUrl}/api/qanta-wholesale-order`,
        JSON.stringify({
          id: writeTestOrderId,
          trackingToken: `load-${writeTestOrderId}`,
          categoryTitle: "Yük Testi",
          createdAt: new Date().toISOString(),
          customer: {
            name: "Yük Testi",
            phone: "05000000000",
          },
          items: [
            {
              id: "load-test-product",
              name: "Yük Testi Ürünü",
              code: "LOAD-001",
              imageSrc: "",
              price: 1,
              quantity: 1,
            },
          ],
        }),
        {
          headers: { "Content-Type": "application/json" },
          tags: { surface: "order_write" },
          timeout: "20s",
        }
      );
      const orderOk = assertOk(orderResponse, "wholesale order api");
      writeErrorRate.add(!orderOk);

      if (decisionToken) {
        const decisionResponse = http.post(
          `${baseUrl}/api/qanta-order-decision/${decisionToken}`,
          JSON.stringify({ decision: "continue_available" }),
          {
            headers: { "Content-Type": "application/json" },
            tags: { surface: "decision_write" },
            timeout: "20s",
          }
        );
        const decisionOk = assertOk(decisionResponse, "order decision api");
        writeErrorRate.add(!decisionOk);
      }
    });
  }

  sleep(1);
}
