from selenium.webdriver.common.by import By
from driver import init_driver

# function to make sure nav bar works
def test_nav_functionality():
    driver = init_driver()

    try:
        driver.get("http://localhost/")
        driver.implicitly_wait(1)

        # navigate to about page
        nav_bar_main = driver.find_element(by=By.CLASS_NAME, value="nav-bar-main")
        nav_bar_main.find_elements(by=By.CLASS_NAME, value="nav-btn")[1].click()
        driver.implicitly_wait(1)
        test1 = driver.current_url == "http://localhost/about/"

        # navigate to help page
        nav_bar_main = driver.find_element(by=By.CLASS_NAME, value="nav-bar-main")
        nav_bar_main.find_elements(by=By.CLASS_NAME, value="nav-btn")[2].click()
        driver.implicitly_wait(1)
        test2 = driver.current_url == "http://localhost/help/"

        # navigate to login page
        nav_bar_login = driver.find_element(by=By.CLASS_NAME, value="nav-bar-login")
        nav_bar_login.find_elements(by=By.CLASS_NAME, value="nav-account")[0].click()
        driver.implicitly_wait(1)
        test3 = driver.current_url == "http://localhost/login/"

        # navigate to signup page
        nav_bar_login = driver.find_element(by=By.CLASS_NAME, value="nav-bar-login")
        nav_bar_login.find_elements(by=By.CLASS_NAME, value="nav-account")[1].click()
        driver.implicitly_wait(1)
        test4 = driver.current_url == "http://localhost/signup/"

        assert test1 and test2 and test3 and test4

    finally:
        driver.quit()


