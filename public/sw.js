self.addEventListener("push", (event) => {
  console.log("Push event received:", event);
  const data = JSON.parse(event.data.text());
  console.log("Push received:", data);

  const title = data.title || "Reminder";
  const options = {
    body: data.message || "You have a new notification!",
    icon: "/icons/icon-192x192.png",
  };

  console.log("Showing notification with title:", title, "and options:", options);

  self.registration.showNotification(title, options);
});
