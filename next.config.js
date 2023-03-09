/** @type {import('next').NextConfig} */
require('dotenv').config

const nextConfig = {
    reactStrictMode: false,
    env: {
        API_URL: process.env.API_URL || 'http://127.0.0.1:5000',
        NN_URL: process.env.NN_URL || 'http://127.0.0.1:8080',
        CLIENT_URL: process.env.CLIENT_URL || 'http://127.0.0.1:3000',
    },
}

module.exports = nextConfig
