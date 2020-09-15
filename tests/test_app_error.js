console.log("app error started");

setTimeout( () => {
    console.error("ERROR!!!!!");
    process.exit(1);
}, 2000);
