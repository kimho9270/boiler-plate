//백엔드 시작점
const express = require('express')
const app = express()
const port = 8001
const cookieParser = require('cookie-parser')
const { auth } = require('./middleware/auth')


const config = require("./config/key")

const {User} = require("./models/User")




//쿠키에 토큰 저장
app.use(cookieParser())

//데이터 가져오는 코드
app.use(express.urlencoded({extended:true}));
//제이선 가져오는 코드
app.use(express.json());

const mongoose = require('mongoose')
mongoose.connect(config.mongoURI,{
    useNewUrlParser: true, useUnifiedTopology: true, useCreateIndex: true, useFindAndModify: false
}).then(()=> console.log('mongoDB connect...'))
.catch(err => console.log(err))




app.post('app/users/register',(req,res) => {
  //회원가입 정보를 데이터 베이스에 넣는다
  const user = new User(req.body)
  user.save((err,userInfo) => {
    if(err){
     return res.json({success: false, err})
    }
    return res.status(200).json({
      success: true
    })
  })
})

app.post('/api/users/login',(req,res)=>{
  
  //요청된 이메일을 데이터 베이스에서 있는지 찾는다.
  User.findOne({email: req.body.email}, (err, user) => {
    if(!user){
      return res.json({
        loginSuccess: false,
        message: "제공된 이메일에 해당하는 유저가 없습니다."
      })
    }
//요청된 이메일이 데이터 베이스에 있다면 비밀번호가 맞는 비밀 번호인지 확인
    user.comparePassword(req.body.password, (err, isMatch) => {
      if(!isMatch){
      return res.json({loginSuccess: false, message: "비밀번호가 틀렸습니다."})
    }
    //비밀번호까지 맞다면 토큰을 생성하기.
    user.generateToken((err,user)=>{
      if(err) return res.status(400).send(err);
      //토큰을 저장한다 어디에? 쿠키,로컬스토리지 나는 쿠키
      res.cookie("x_auth", user.token)
      .status(200)
      .json({loginSuccess: true, userID: user._id})
    })
    })
  })
})

app.get('/api/users/auth', auth,(req,res) => {
  //여기까지 미들웨어를 통과해 왔다는 얘기는  Authentication아 트루라는 말
  res.status(200).json({
    _id: req.user._id,
    isAdmin: req.user.role === 0 ? false:true,
    ifAuth: true,
    email: req.user.email,
    name: req.user.name
  })
})

app.get('/api/users/logout', auth ,(req,res)=>
  User.findOneAndUpdate({_id: req.user._id},
     {token: ""}
  ,(err,user) => {
    if(err) return res.json({success:false, err})
    return res.status(200).send({
      success: true
    })
  
  })
)


app.set('views', __dirname + '/views');
app.set('view engine', 'ejs')
app.get('/', (req, res) => {
  res.render('index')
})


app.listen(8001, () => {
  console.log(`Example app listening at http://localhost:${port}`)
})