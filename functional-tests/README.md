# GrETEL5 functional tests

GrETEL5

This is a functional test suite based on [pytest][1] and [Selenium WebDriver][2]. It is designed such that it can test any network-reachable instance of the GrETEL5 application. While the tests are based on knowledge about the user interface of the application, no knowledge of its implementation is needed.

[1]: https://docs.pytest.org/en/latest/
[2]: https://www.selenium.dev/documentation/webdriver/


## Before you start

You need to install the following software:

 - Python >= 3.8, <= 3.10
 - virtualenv
 - WebDriver for at least one browser

You can find links to WebDrivers for the most common browsers [over here][3].

[3]: https://pypi.org/project/selenium/#drivers


## How it works

Every test in this suite is a short, automated simulation of the interaction between a user and GrETEL5, written in Python. [Selenium][2] provides the programmable web browser interface while [pytest][1] provides administrative support in the form of configuration and fixtures.

A typical test starts by visiting a page of the application. The "user" then interacts with the application by clicking on buttons and links, filling and submitting forms, etcetera. The result is validated by checking that the user ends up at the right page, particular content is present, and so forth. Finally, some cleanup is done in order to not influence the next test.

Each test is written as a single function. Functions are grouped in files, which are in turn grouped in directories. There is a many-to-many relationship between fixtures and tests. Fixtures, like tests, can exist at any level of the directory hierarchy. In principle, it is entirely up to the tester how to organize the tests and fixtures.

The root directory of the suite contains the main `conftest.py` (next to this README). This module handles the configuration of the test suite and also provides fixtures that are available everywhere within the suite.


## Running the tests

### Quickstart

Create and activate a virtualenv. To install the packages:

```console
$ pip install pip-tools
$ pip-sync
```

then, to start the suite with default settings:

```console
$ pytest
```

This will attempt to run the suite in Firefox and Chrome. It assumes that you have the application running locally on port 4200. In order specify other browsers or another network address, read on.


### Configuring the browsers

Suppose that you want to run the suite in Safari. You can configure this once by creating a `pytest.ini` next to this README with the following content:

```ini
[pytest]
webdriver =
    Safari
```

If you want to run the suite in multiple browsers, put each browser on a separate line. The available browser names are listed below.

You can also override the browser setting for a single run by passing an argument to the `pytest` command line invocation:

```console
$ pytest -o webdriver=Firefox
```

You can pass multiple browsers by wrapping the option value in quotes and separating them by newlines:

```console
$ pytest -o webdriver="Firefox
> Edge"
```


#### Available WebDriver names

Android
BlackBerry
Chrome
Edge
Firefox
Ie
Opera
PhantomJS
Proxy
Remote
Safari
WebKitGTK


### Configuring the base address

To run the suite with an instance of the application that runs elsewhere, pass the address of the home page of the application on the command line. The address should include the scheme and the path with a trailing `/`. For example:

```console
$ pytest --base-address http://localhost:5000/
$ pytest --base-address https://www.gretel5.com/app/
```

If you want the base address to always default to something other than `http://localhost:4200/`, you can also set this in the `pytest.ini`:

```ini
[pytest]
webdriver =
    Safari
addopts = --base-address http://localhost:5000/
```


## Writing tests

Test functions and modules that contain test functions should always have a name that starts with `test_`. A typical test function looks like this:

```py
def test_something(browser, base_address):
    url = base_address + some_path
    browser.get(url)
    # more operations on browser
    assert 'Some String' in browser.title
    assert browser.some_method() == some_value
```

`browser`, as you have probably guessed, is the fixture that provides the webdriver instance on which you can simulate user interaction. The elegance of pytest shines here; if you have configured the suite to run with multiple browsers, the test will be run once for every browser, so you can pretend that there is only one browser in your test. The available properties and methods on the `browser` are documented [over here][4]. In some cases, you will need to [wait][5] after an interaction before you can continue your test. There is also a full [API documentation][10] for the Selenium Python bindings.

[4]: https://www.selenium.dev/documentation/webdriver/capabilities/
[5]: https://www.selenium.dev/documentation/webdriver/waits/
[10]: https://www.selenium.dev/selenium/docs/api/py/api.html

`base_address` is the main address fixture. It is just a string, containing either whatever you passed as the `--base-address` or the default of `http://localhost:4200/`. There are a couple of derived address fixtures: `api_address`, `api_auth_address` and `admin_address`. Whenever you need to pass an address to the `browser`, make sure to compute this address relative to the `base_address` or one of its derived fixtures; this ensures that all requests in the test suite go to the right instance of the application.

Besides `browser` and the `*_address` fixtures, pytest provides several builtin fixtures that you can use. Especially the [`tmpdir` fixture][6] can be useful if, for example, you want to download files from the application. You can get a full list of available fixtures by running `pytest -q --fixtures`. You can also add your own fixtures; see below.

[6]: https://docs.pytest.org/en/latest/tmpdir.html#the-tmpdir-fixture


## Writing fixtures

In a fixture function, you can write approximately the same kind of code as in a test function. Your fixture can depend on other fixtures that it takes as parameters. By extension, you can also use the `browser` fixture with the full [WebDriver API][4]. The main ways in which a fixture is different are the following:

 - Fixtures are always decorated with `@pytest.fixture`, so modules that contain fixtures must `import pytest`.
 - Fixtures may either `return` or `yield` a single value. This value is what tests and other fixtures receive when they take the name of a fixture as a parameter.
 - If a fixture contains a `yield` statement, everything after the `yield` is teardown code. The teardown code gets executed when all dependent tests and other fixtures have completed.
 - Fixtures should not behave as generators, i.e., they should not `yield` multiple times. If you want to have multiple variants of a fixture, make it [parametric][8] instead.

Some examples follow below. For further information, the pytest documentation has a [comprehensive overview][7] that adresses (nearly) all aspects of fixtures.

[7]: https://docs.pytest.org/en/latest/fixture.html
[8]: https://docs.pytest.org/en/latest/fixture.html#parametrizing-fixtures


### Example 1: common starting address

Suppose we have a test module in which all tests start on the same page. We have the path to this page (relative to the base address) stored in the global constant `START_PATH`. Naievely, we may simply start every test like this:

```py
def test_something(browser, base_address):
    browser.get(base_address + START_PATH)
    # continue with interactions and assertions
```

but we would be repeating ourselves. To make this [DRY][9]er, we can move this initial page fetch into a fixture at the top of the module:

[9]: https://en.wikipedia.org/wiki/Don%27t_repeat_yourself

```py
import pytest

START_PATH = 'some/path/'

@pytest.fixture
def start_page(browser, base_address):
    browser.get(base_address + START_PATH)
    # implicit return
```

and then use it like this in each test:

```py
def test_something(browser, start_page):
    # browser is already on the right page
    # continue with interactions and assertions
```

To make this even DRYer, we can factor out the address computation from the `start_page` fixture. After all, we may navigate away from the starting page in some tests and then want to return to it. The top of our module would change into this:

```py
import pytest

START_PATH = 'some/path/'

@pytest.fixture
def start_address(base_address):
    return base_address + START_PATH

@pytest.fixture
def start_page(browser, start_address):
    browser.get(start_address)
    # implicit return
```

The tests could remain the same after this change, but now we have the option to use `start_address` as an additional fixture in tests that need to return to this page later.


### Example 2: being authenticated

For some tests, we may have to log in first. It would be convenient if our tests can have this condition fulfilled by just using a fixture, like this:

```py
def some_test(browser, base_address, login):
    # user already authenticated on browser (cookie is set)
    # continue with interactions and assertions
```

Since we might want to log in in any test, we will put our `login` fixture in the `conftest.py` in the root of the test suite. Our first throw at it could look like this:

```py
import pytest
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support.expected_conditions import url_changes, title_is

USER_NAME = 'me'
USER_PASS = '12345'

@pytest.fixture
def login(browser, api_auth_address):
    login_address = api_auth_address + 'login/'
    browser.get(login_address)
    name_input = browser.find_element_by_name('username')
    name_input.send_keys(USER_NAME)
    pass_input = browser.find_element_by_name('password')
    pass_input.send_keys(USER_PASS)
    pass_input.submit()
    WebDriverWait(browser, 2).until(url_changes(login_address))
    WebDriverWait(browser, 2).until_not(title_is(''))
    # at this point, the cookie should be set
    # implicit return
```

You may wonder why we don't `yield` and then add teardown code after it in which we logout again. The answer is that this isn't necessary, because the teardown code of the `browser` fixture already deletes the cookies after every test.

We can do better than this. The `login` fixture lets us start in an authenticated state, but if we want to log in only halfway during a test, it doesn't help us. We may also sometimes want to use different user credentials. We can enable both by encapsulating users in a class and using this in multiple fixtures:

```py
import pytest
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support.expected_conditions import url_changes, title_is

USER_NAME = 'me'
USER_PASS = '12345'

class User(object):
    def __init__(self, username, password, browser=None):
        self.username = username
        self.password = password
        self.browser = browser

    def login(self, login_address, browser=None):
        driver = browser or self.browser
        assert driver is not None
        driver.get(login_address)
        name_input = driver.find_element_by_name('username')
        name_input.send_keys(USER_NAME)
        pass_input = driver.find_element_by_name('password')
        pass_input.send_keys(USER_PASS)
        pass_input.submit()
        WebDriverWait(driver, 2).until(url_changes(login_address))
        WebDriverWait(driver, 2).until_not(title_is(''))
        # at this point, the cookie should be set

    def logout(self, logout_address, browser=None):
        # left as an exercise to the reader

@pytest.fixture
def default_user(browser):
    return User(USER_NAME, USER_PASS, browser)

@pytest.fixture
def login(browser, api_auth_address, default_user):
    login_address = api_auth_address + 'login/'
    default_user.login(login_address)
    # implicit return
```

Now we have a lot more options. We may login, change our password, logout and try whether we can login with the new password. We may also create new users inside fixtures or during tests and pass the dynamically generated users around in a `User` instance, although this requires the default user to have admin rights.

We may also want to be able to override the username and password from the command line or the `pytest.ini`. This is especially useful if we want our default user to have admin rights. Here's the basic way to do it by adding new entries to the `pytest.ini`:

```py
import pytest
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support.expected_conditions import url_changes, title_is

USER_NAME = 'me'
USER_PASS = '12345'
USER_INI_NAME = 'default_user'
USER_INI_PASS = 'default_pwd'

def pytest_addoption(parser):
    # append this to the code that was already there:
    parser.addini(USER_INI_NAME, 'Name of the default user', default=USER_NAME)
    parser.addini(USER_INI_PASS, 'Password of the default user', default=USER_PASS)

class User(object):
    # same as before

@pytest.fixture
def default_user(browser, pytestconfig):
    username = pytestconfig.getini(USER_INI_NAME)
    password = pytestconfig.getini(USER_INI_PASS)
    return User(username, password, browser)

@pytest.fixture
def login(browser, api_auth_address, default_user):
    # same as before
```

We can now override the username and password by setting them in our `pytest.ini`:

```ini
[pytest]
default_user = me_again
default_pwd = 54321
```
