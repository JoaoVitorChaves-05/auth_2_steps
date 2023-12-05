class HomeController {
    constructor() {

    }

    index(req, res) {
        return res.render('index')
    }
}

export default new HomeController()