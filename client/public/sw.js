self.addEventListener("push", (event) => {
    console.log("Push received");

    const data = event.data.json();

    event.waitUntil(
        self.registration.showNotification(data.title, {
            body: data.body
        })
    );
});