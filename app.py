#Password generator and hashing
#Generate password /generate
#Hashpassword /hash
#save to database /save
from flask import Flask, request, render_template

app = Flask(__name__)

