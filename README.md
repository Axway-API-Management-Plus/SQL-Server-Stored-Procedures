# Description
This artefact describes how to :
- Connect API Gateway to an SQL Server database
- call a stored procedure 


## API Management Version Compatibilty
This artefact was successfully tested for the following versions:
- 7.4.1


## Install : SQL connection setup
**Introduction**

This section describes how to connect an API Gateway to an SQL Server database. It is not a best practices but more a how-to guide to connect quickly an SQL Server database (for a POC for example)
In this guide, the API Gateway is installed on a Windows

**Driver JDBC installation**
- Download JDBC driver from https://www.microsoft.com/en-us/download/details.aspx?displaylang=en&id=11774
- Unzipp package(sqljdbc6.0)
- Copy “enu/sqljdbc42.jar” in the directory “apigateway/ext/lib”
- Copy ”enu/auth/x86/sqljdbc_auth.dll” in the directory “apigateway/win32/lib”
- Restart API Gateway instance

**Reference drivers in Policy Studio**
- Drill down to Window > Preferences > Runtime Deps.
- Do not forget to restart Policy Studio with the option “-clean”

![alt text][Screenshot1]
[Screenshot1]: https://github.com/Axway-API-Management/SQL-Server-Stored-Procedures/blob/master/Readme/Screenshot1.png  "Screenshot1"   

**“mixed mode” authentication activation**
- Launch SQL Server Management Studio (Start > Run… > ssms > OK)
- Right click on Server and properties
- Open the “Security” section
- Choose “SQL Server and …”
- Refer to https://msdn.microsoft.com/en-us/library/ms188670.aspx

![alt text][Screenshot2]
[Screenshot2]: https://github.com/Axway-API-Management/SQL-Server-Stored-Procedures/blob/master/Readme/Screenshot2.png  "Screenshot2"   

**sa user activation**
- “Security” > ”Logins”
- Double click on “sa”
- Enter a new password and confirm it
- Select “Enabled” in the tab ”Status”  

![alt text][Screenshot3]
[Screenshot3]: https://github.com/Axway-API-Management/SQL-Server-Stored-Procedures/blob/master/Readme/Screenshot3.png  "Screenshot3"   

**TCP activation**
- Run SQL Server Configuration Manager : Start > Run… > SQLServerManager11.msc > OK
- in "SQL Server Network Configuration" section, select “Protocols for SQLEXPRESS" and click on “TCP/IP”

![alt text][Screenshot4]
[Screenshot4]: https://github.com/Axway-API-Management/SQL-Server-Stored-Procedures/blob/master/Readme/Screenshot4.png  "Screenshot4"   

- In the tab “Protocol” turn "Enabled” to “Yes”
- In the tab "IP Addresses”, go directly at the bottom and in the section “IPAll” select "TCP port" to 1433
- “TCP Dynamic Port” must stay empty

![alt text][Screenshot5]
[Screenshot5]: https://github.com/Axway-API-Management/SQL-Server-Stored-Procedures/blob/master/Readme/Screenshot5.png  "Screenshot5"   

**Start “SQL Server” service**
- In SQL Server Management Studio, right click on the server
- Click on "Restart"

![alt text][Screenshot6]
[Screenshot6]: https://github.com/Axway-API-Management/SQL-Server-Stored-Procedures/blob/master/Readme/Screenshot6.png  "Screenshot6"   

**JDBC connection setup in Policy Studio**
- In Policy Studio, Drill down to “External Connections”
- Click on “Database Connections”
- Click on “Add a Database Connection”

![alt text][Screenshot7]
[Screenshot7]: https://github.com/Axway-API-Management/SQL-Server-Stored-Procedures/blob/master/Readme/Screenshot7.png  "Screenshot7"   

- Add a name
- fill in JDBC URL: jdbc:sqlserver://<server>:1433;databaseName=<db>
- Username: sa
- Password: <sa password>
- Click on “Test Connection”
- If the test is OK, click on “OK”

![alt text][Screenshot8]
[Screenshot8]: https://github.com/Axway-API-Management/SQL-Server-Stored-Procedures/blob/master/Readme/Screenshot8.png  "Screenshot8"   

## Usage : Call the stored procedure
**Introduction**

This section describes how to call a SQL Server stored procedure. It is not a best practices but more a how-to guide to connect quickly an SQL Server database (for a POC for example)
In this guide, the API Gateway is installed on a Windows

**Context**

The API Gateway owns a filter “Read/Write Database” which can be used to request a SQL database with a request (such as SELECT, INSERT, DELETE, UPDATE) or a stored procedure.
Unfortunately, only the first result is returned from a stored procedure.

**Solution**

To read all the resultsets, the filter "Scripting" is used.
A JavaScript is used to : 
- Retrieve the database connection from the one configured in the configuration
- Call the stored procedure
- Return all data contained in the resultsets in a JSON formatRetourner

**Script interface**
- Configuration :
  * Connection data are setup in the configuration
- Input : 
  * Attribute “db_connection” : object name for the database connection (ex: “MS SQL Server”)
  * Attribute “db_statement” : Request to call the stored procedure
  * Attribute “db_param_n” (n : integer > 0) : if the stored procedure needs input parameters, they are set thanks to those attributes 
- Output :
  * Attribute “content” : JSON structure containing all the data
 
**Configuration**
- Configuration object declaration
  * Parameter “Name” is used to retrieve the connection object from the script
  
![alt text][Screenshot9]
[Screenshot9]: https://github.com/Axway-API-Management/SQL-Server-Stored-Procedures/blob/master/Readme/Screenshot9.png  "Screenshot9"   

- Attribute “db_connection” setup 

![alt text][Screenshot10]
[Screenshot10]: https://github.com/Axway-API-Management/SQL-Server-Stored-Procedures/blob/master/Readme/Screenshot10.png  "Screenshot10"   

**Input : db_statement et db_param_n**
- db_statement contained the stored procedure call 
  * Either using the standard JDBC format : { call MyStoredProcedure(?, ?) }
  * Either using a underneath engine specific format : EXECUTE MyStoredProcedure @param1 = ?, @param2 = ?

- Parameters are declared with “?” and their values are passed with the attributes ”db_param_n”
  * n = 1 for the first parameter, 2 for the second, etc.

![alt text][Screenshot11]
[Screenshot11]: https://github.com/Axway-API-Management/SQL-Server-Stored-Procedures/blob/master/Readme/Screenshot11.png  "Screenshot11"   

**Output : content**

The attribute “content” contains all data in a JSON format:

![alt text][Screenshot12]
[Screenshot12]: https://github.com/Axway-API-Management/SQL-Server-Stored-Procedures/blob/master/Readme/Screenshot12.png  "Screenshot12"   

**Policy structure**

![alt text][Screenshot13]
[Screenshot13]: https://github.com/Axway-API-Management/SQL-Server-Stored-Procedures/blob/master/Readme/Screenshot13.png  "Screenshot13"   

**Script structure**

![alt text][Screenshot14]
[Screenshot14]: https://github.com/Axway-API-Management/SQL-Server-Stored-Procedures/blob/master/Readme/Screenshot14.png  "Screenshot14"   

 

## Bug and Caveats

Nothing identified

## Contributing

Please read [Contributing.md] (/Contributing.md) for details on our code of conduct, and the process for submitting pull requests to us.

## Team

![alt text][Axwaylogo] Axway Team

[Axwaylogo]: https://github.com/Axway-API-Management/Common/blob/master/img/AxwayLogoSmall.png  "Axway logo"


## License
Apache License 2.0 (refer to document [license] (/LICENSE))

