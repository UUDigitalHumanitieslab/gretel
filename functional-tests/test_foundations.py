def test_gretel5_frontend(browser, base_address):
    browser.get(base_address)
    assert 'GrETEL5' in browser.title


def test_gretel5_admin(browser, admin_address):
    browser.get(admin_address)
    assert 'Django' in browser.title


def test_gretel5_api(browser, api_address):
    browser.get(api_address)
    assert 'Api Root' in browser.title


def test_gretel5_api_auth(browser, api_auth_address):
    browser.get(api_auth_address + 'login/')
    assert 'Django REST framework' in browser.title
