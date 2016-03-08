# gretel

----------
GrETEL 2.0
----------

--- INFO ---
v2.0.1 March 2016: minor bug fixes
v2.0 November 2014: delivered to the TST-Centrale

URL: http://gretel.ccl.kuleuven.be/gretel-2.0

--- INSTALLATION ---

1. Download GrETEL
2. Create directories log, tmp, and parsers (make sure tmp and log are writable)
3. Put Alpino parser in the parsers directory. Current version in GrETEL: Alpino-x86_64-linux-glibc2.5-20548-sicstus (http://www.let.rug.nl/vannoord/alp/Alpino/versions/binary)
4. Adapt config/config.php file
   - Set paths to home directory and home URL
   - Set path to Alpino parser
   - Set BaseX variables
   

--- KNOWN BUGS ---

- Tree visualisation is no longer supported in Google Chrome
- Different types of progress bars appear if the results.php page is loading
