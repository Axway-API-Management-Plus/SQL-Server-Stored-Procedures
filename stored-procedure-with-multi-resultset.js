
importPackage(Packages.java.sql);
importPackage(Packages.com.vordel.trace);
importPackage(Packages.com.vordel.common.db);

function invoke(msg) {
    // Retrieve the database configuration object from attributes
    var databaseConfiguration = msg.get("db_connection");
    Trace.debug("db_connection = '" + databaseConfiguration + "'");

    // Retrieve the database statement from attributes
    // The statement can be the standard syntax :
    //   { call MyStoredProcedure(?, ?) }
    // or someting more specific to the underlying database engine :
    //   EXEC	[dbo].[MyStoredProcedure] @p1 = ?, @p2 = ?
    var databaseStatement = msg.get("db_statement");
    Trace.debug("db_statement = '" + databaseStatement + "'");

    // Connect to database
    var con = DbConnectionCache.getConnection(databaseConfiguration).getConnection();

    // Prepare the call to the stored procedure
    var stmt = con.prepareCall(databaseStatement);

    // Count how many parameters are required (count the number of "?")
    var paramCount = (databaseStatement.match(/[?]/g) || []).length;
    for (var p = 1; p <= paramCount; p++) {
      // Set a value for each parameter by fetching the "db_param_i"
      // where i is the param number (starting at 1)
      stmt.setObject(p, msg.get("db_param_" + p));
    }

    // Execute the request
    var hasResultSet = stmt.execute();
    var updateCount = stmt.getUpdateCount();

    // Extract the data from the resultsets
    var retval = [];
    var i = 1;
    do {
      if (hasResultSet) { // Result Set
        var rs = stmt.getResultSet();
        var metadata = rs.getMetaData();
        var columns = metadata.getColumnCount();
        var columnCache = {}
        var list = [];
        while (rs.next()) {
            var obj = {}
            for (var c = 1; c <= columns; c++) {
                var key = c.toString();
                if (!columnCache.hasOwnProperty(key)) {
                    columnCache[key] = metadata.getColumnName(key);
                }
                obj[columnCache[key]] = rs.getString(c) + ""; // cast Java string as JS string
            }
            list.push(obj);
        }
        rs.close();
        retval.push(list);
        i++;
      } else { // Update Count
        Trace.info("(" + updateCount + " lines affected)");
      }

      // Check for next result set
      hasResultSet = stmt.getMoreResults();
      updateCount = stmt.getUpdateCount();
      Trace.debug("result set = " + hasResultSet + ", updateCount = " + updateCount);
    } while (hasResultSet || updateCount != -1);
    stmt.close();

    // Sets the body of the response
    var attr_val = JSON.stringify(retval);
    Trace.debug("content = " + attr_val);
    msg.put("content", attr_val);

    return true;
}
