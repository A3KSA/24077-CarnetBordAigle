// This is the configuration file for PM2
module.exports = {
    apps: [{
        name: "Missaticus",
        script: "./app.js",
        node_args: "--env-file=.env",
        watch: true,
        ignore_watch: ["node_modules", "public/", "**/*.json", "docs/"],
        watch_options: {
            followSymlinks: false
        },
        env: {
            "NODE_ENV": "development"
        },
        env_production: {
            "NODE_ENV": "production"
        }

    }]
}