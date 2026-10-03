import webpush from "web-push";

console.log("VAPID:", process.env.VAPID_PUBLIC_KEY);

webpush.setVapidDetails(
    "mailto:gdevadiga109@gmail.com",
    process.env.VAPID_PUBLIC_KEY,
    process.env.VAPID_PRIVATE_KEY
);

export default webpush;