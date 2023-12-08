const express = require("express"); 
const app = express();
app.listen(3000);
console.log("Servern körs på port 3000");

app.get("/", function (req, res) {
    res.sendFile(__dirname + "/Hello.html");
  });

  const mysql = require("mysql"); 
con = mysql.createConnection({
  host: "localhost", 
  user: "root", 
  password: "", 
  database: "jensen2023", 
  multipleStatements: true,
});

const COLUMNS = ["id", "username", "password", "name", "email"]; 


app.get("/users", function (req, res) {
  let sql = "SELECT * FROM users";
  let condition = createCondition(req.query); 
  console.log(sql + condition); 
  con.query(sql + condition, function (err, result, fields) {
    res.send(result);
  });
});

const createCondition = function (query) {
 
  console.log(query);
  let output = " WHERE ";
  for (let key in query) {
    if (COLUMNS.includes(key)) {

      output += `${key}="${query[key]}" OR `; 
    }
  }
  if (output.length == 7) {
    return ""; 
  } else {
    return output.substring(0, output.length - 4); 
  }
};


app.get("/users/:id", function (req, res) {
  
  let sql = "SELECT * FROM users WHERE id=" + req.params.id;
  console.log(sql);

  con.query(sql, function (err, result, fields) {
    if (result.length > 0) {
      res.send(result);
    } else {
      res.sendStatus(204);
    }
  });
});

app.use(express.json());

app.post("/users", function (req, res) {
    
    if (!req.body.username) {
      res.status(400).send("username required!");
      return; 
    }
    let fields = ["username", "password", "name", "email"]; 
    for (let key in req.body) {
      if (!fields.includes(key)) {
        res.status(400).send("Unknown field: " + key);
        return; 
      }
    }
   
    let sql = `INSERT INTO users (username, password, name, email)
      VALUES ('${req.body.username}', 
      '${req.body.password}',
      '${req.body.name}',
      '${req.body.email}');
      SELECT LAST_INSERT_ID();`; 
    console.log(sql);
  
    con.query(sql, function (err, result, fields) {
      if (err) throw err;
      console.log(result);
      let output = {
        id: result[0].insertId,
        username: req.body.username,
        password: req.body.password,
        name: req.body.name,
        email: req.body.email,
      };
      res.send(output);
    });
  });
