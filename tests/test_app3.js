setInterval( () => {
    console.log("tick");
}, 1000);

process.on("SIGTERM", () => {
    console.log("Termination signal received");
    setTimeout( () => {
        process.exit();
    }, 15000);
});