if(process.env.NODE_ENV !== "production"){
    require("dotenv").config()
}
//Bibliotecas Instaladas
const express = require ("express")
const app = express()
const bcrypt = require ("bcrypt")
const passport = require("passport")
const initializePassport = require("./passport-config")
const flash = require("express-flash")
const session = require("express-session")
const methodOverride = require("method-override")
const Sequelize = require('sequelize')
const Post = require ('./models/Post')
const Registro = require('./models/registro_db')

initializePassport(
    passport,
    email => users.find(user =>user.email === email),
    id => users.find(user => user.id === id)
)

const users = []

app.use('/public', express.static('public'))
app.use(express.urlencoded({extended: false}))
app.use(flash())
app.use(session({
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: false,
    is_logged_in: false
}))
app.use(passport.initialize())
app.use(passport.session())
app.use(methodOverride("_method"))

//Processo de Login
app.post("/login", checkNotAuthenticated, passport.authenticate("local", {
    successRedirect: "/",
    failureRedirect: "/login",
    failureFlash: true
}))

//Processo de Registro
app.post("/register", async (req, res) =>{
    try{
        const hashedPassword = await bcrypt.hash(req.body.password, 10)
        users.push({
            id:Date.now().toString(),
            name: req.body.name,
            email: req.body.email,
            password: hashedPassword,
        })
        console.log(users)
        res.redirect("/login")
    } catch (e) {
        console.log(e);
        res.redirect("/register")
    }
})
//Início das Rotas
//Rota Home (Página Não restrita)
app.get('/home', function(req, res){
    Post.findAll({order:[['id', 'DESC']]}).then(function(posts){
        res.render("home.ejs", {posts:posts})
    })
})
//Rota de Visualização
app.get('/posts', checkAuthenticated, function(req, res){
    Post.findAll({order:[['id', 'DESC']]}).then(function(posts){
        res.render("posts.ejs", {posts:posts})
    })
})
//Rota cadastro
app.get('/cadastro', checkAuthenticated, (req, res) =>{
    res.render("cadastro.ejs", {name: req.user.name})
})
//Rota Index
app.get('/', checkAuthenticated, (req, res) =>{
    res.render("index.ejs", {name: req.user.name})
})
//Rota Login
app.get('/login', checkNotAuthenticated, (req, res) =>{
    res.render("login.ejs")
})

//Rota Registro
app.get('/register', checkNotAuthenticated, (req, res)=>{
    res.render("register.ejs")
})
//fim das rotas

//Inserção de dados na tabela postagem
app.post('/add', function(req, res){
    Post.create({
        titulo: req.body.titulo,
        conteudo: req.body.conteudo
    }).then(function(){
        res.redirect('/posts')
    }).catch(function(err){
        res.send("A Postagem não existe.")
    })
})

//deletar dados da tabela postagem
app.get('/deletar/:id', function(req, res){
    Post.destroy({where: {'id': req.params.id}}).then(function(){
        res.redirect('/posts')
    }).catch(function(err){
        res.send("A Postagem não Existe.")
    })
})

//Comando para deslogar do sistema
app.delete("/logout", (req, res) =>{
    req.logout(req.user, err =>{
        if (err) return next(err)
        res.redirect("/")
    })
})

//Funções de Autenticação
function checkAuthenticated(req, res, next){
    if(req.isAuthenticated()){
        return next()
    }
    res.redirect("/login")
}

function checkNotAuthenticated(req, res, next){
    if(req.isAuthenticated()){
        return res.redirect("/inicio")
    }
    next()
}

//Localhost
app.listen(3000, function(){
    console.log("Foi carai")
})