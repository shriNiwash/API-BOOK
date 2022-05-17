# Getting started with CRUD Operation

# You can run the application by writting

# 'node app.js'
The application starts when node app.js is entered in the terminal .

# To use the CRUD Operation and API CRUD we have to run the APPLICATION FIRST,

It will run on the Local (http://localhost:3000/) and the Home page can be seen,
and also if any error occures then it well shown in the terminal.

# This Application Contains Create ,Read , Updata and Delete operation 
The Home page contain(http://localhost:3000/) the form where we fill the form for 
insertion after clicking on submit.. and it will redirect to the List page which is 
also maintioned in the Navbar.


# CRUD Operation API
The API is tested over POSTMAN and looks good to go for work.
The all the operations listed below,with the specific URL,

# POST:- (http://localhost:3000/books)
To add new data on the database.

# GET:- (http://localhost:3000/books)
To fetch all the data over database.

# GET:- (http://localhost:3000/books/list/625fedc281912f789c4feab1)
For fetching a specific data by ID, ID could be like (6260f6cae2a7550f5d1b53d4).

# PATCH:- (http://localhost:3000/books/list/625fedc281912f789c4feab1)
This URL update the particular Data in database by with help of specific ID.

# DELETE:- (http://localhost:3000/books/list/625fedc281912f789c4feab1)
This URL can be used to Delete any particular Data from the database with the help of ID which is maintioned above in the URL.


When performing any Operation with the API the fetched Data can be seen in the terminal.

The Database Created over mongodb.com cluster. And i have made local Database also ie ("mongodb://127.0.0.1/books" ). But The cluster is implemented in this Application.

URL :- mongodb+srv://shriNiwash:<password>@cluster0.waox8.mongodb.net/myFirstDatabase?retryWrites=true&w=majority