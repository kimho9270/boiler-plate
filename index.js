//백엔드 시작점
const express = require('express')
const app = express()
const port = 5000

const config = require("./config/key")

const {User} = require("./models/User")

//데이터 가져오는 코드
app.use(express.urlencoded({extended:true}));
//제이선 가져오는 코드
app.use(express.json());

const mongoose = require('mongoose')
mongoose.connect(config.mongoURI,{
    useNewUrlParser: true, useUnifiedTopology: true, useCreateIndex: true, useFindAndModify: false
}).then(()=> console.log('mongoDB connect...'))
.catch(err => console.log(err))


app.get('/', (req, res) => {
  res.send('Hello World!')
})

app.post('/register',(req,res) => {
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

app.listen(port, () => {
  console.log(`Example app listening at http://localhost:${port}`)
})