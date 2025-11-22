import axios from "axios";

const API_URL = "https://paksmmpanel.com/api/v2";
const API_KEY = "1c53107009e979d8a1b2dd4536c171c8cf200194";

export async function createOrder(service, link, quantity) {
  const res = await axios.post(API_URL, {
    key: API_KEY,
    action: "add",
    service,
    url: link,
    quantity
  });
  return res.data;
}

export async function checkStatus(orderId) {
  const res = await axios.post(API_URL, {
    key: API_KEY,
    action: "status",
    order: orderId
  });
  return res.data;
}
