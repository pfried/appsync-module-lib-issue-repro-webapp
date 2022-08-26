module.exports = {
    style: {
        postcss: {
            plugins: {
                'postcss-import': {},
                'tailwindcss/nesting': {},
                tailwindcss: {},
                autoprefixer: {},
            }
        }
    },
    webpack: {
    }
}