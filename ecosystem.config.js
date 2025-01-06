// This is the configuration file for PM2
module.exports = {
    apps: [{
        name: "CarnetDeBord Aigle",
        script: "./server.js",
        node_args: "--env-file=.env",
        watch: true,
        ignore_watch: ["node_modules", "public/", "**/*.json", "docs/"],
        env: {
            NODE_ENV: 'development',
            PORT: 5000, // Port utilisé par ton application
          },
          env_production: {
            NODE_ENV: 'production',
            PORT: 5000,
          },
    }]
}