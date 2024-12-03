from selenium.webdriver.common.by import By
from driver import init_driver
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC
import time


# function to test the functionality of the bookshelf page
# login, view, search, add, edit, delete, and logout
def test_bookshelf_functionality():
    driver = init_driver()

    try:
        driver.get("http://localhost/")
        driver.execute_script("localStorage.setItem('user', 'test')")
        driver.implicitly_wait(3)

        # navigate to login page
        nav_bar_login = driver.find_element(by=By.CLASS_NAME, value="nav-bar-login")
        nav_bar_login.find_elements(by=By.CLASS_NAME, value="nav-account")[0].click()
        driver.implicitly_wait(1)
        
        # login with test account
        emailInput = driver.find_element(by=By.ID, value="email")
        passwordInput = driver.find_element(by=By.ID, value="password")
        emailInput.send_keys("bookshelf.ai.official@gmail.com")
        passwordInput.send_keys("testpassword")
        driver.execute_async_script("document.getElementById('confirmLogin').click()")
        
        WebDriverWait(driver, 10).until(EC.alert_is_present())
        time.sleep(2)
        driver.switch_to.alert.accept()

        # test to see if jwt is stored in localstorage
        test1 = driver.execute_script("return localStorage.getItem('jwt')") != None

        # navigate to about then bookshelf page
        time.sleep(3)
        nav_bar_main = driver.find_element(by=By.CLASS_NAME, value="nav-bar-main")
        nav_bar_main.find_elements(by=By.CLASS_NAME, value="nav-btn")[4].click()

        # test to see if selenium driver is on bookshelf page
        test2 = driver.current_url == "http://localhost/bookshelf/"

        time.sleep(2)

        # make sure there are two books in the bookshelf
        test3 = len(driver.find_elements(by=By.CLASS_NAME, value="book")) == 2

        # search for book with title randombook
        searchTitleInput = driver.find_element(by=By.ID, value="title")
        searchTitleInput.send_keys("randombook")
        driver.execute_script("document.getElementById('search').click()")
        time.sleep(1)

        # test to see if only one book is rendered
        test4 = len(driver.find_elements(by=By.CLASS_NAME, value="book")) == 1
        
        # test to see if bookshelf-title has text "Bookshelf: 1 Books"
        bookshelfTitle = driver.find_element(by=By.ID, value="bookshelf-title")
        test5 = bookshelfTitle.text == "Bookshelf: 1 Books"

        # reset search
        driver.execute_script("document.getElementById('reset').click()")
        time.sleep(1)
        
        # test to see if two books are rendered again
        test6 = len(driver.find_elements(by=By.CLASS_NAME, value="book")) == 2

        # add book
        driver.find_element(by=By.ID, value="addTitle").send_keys("testbook")
        driver.find_element(by=By.ID, value="addAuthor").send_keys("testauthor")    
        driver.find_element(by=By.ID, value="addPublished").send_keys("2024")
        driver.find_element(by=By.ID, value="addIsbn").send_keys("1234567890")
        driver.find_element(by=By.ID, value="addGenre").send_keys("horror")
        driver.find_element(by=By.ID, value="addSummary").send_keys("a scary test book")
        driver.find_element(by=By.ID, value="addTags").send_keys("tag1 tag2 tag3")
        driver.find_element(by=By.ID, value="addConfirm").click()
        WebDriverWait(driver, 10).until(EC.alert_is_present())
        driver.switch_to.alert.accept()
        time.sleep(2)

        # test to see if three books are rendered
        test7 = len(driver.find_elements(by=By.CLASS_NAME, value="book")) == 3

        # test to see if title of 3rd book is "testbook"
        test8 = driver.find_elements(by=By.CLASS_NAME, value="book")[2].find_element(by=By.CLASS_NAME, value="title").text == "Title: testbook"

        # edit book
        driver.implicitly_wait(5)
        driver.execute_script("document.getElementsByClassName('edit')[2].click()")
        driver.find_element(by=By.ID, value="newTitle").clear()
        driver.find_element(by=By.ID, value="newTitle").send_keys("testbookedit")
        driver.find_element(by=By.CLASS_NAME, value="editConfirm").click()
        time.sleep(2)

        # test to see if title of 3rd book is "testbookedit"
        test9 = driver.find_elements(by=By.CLASS_NAME, value="book")[2].find_element(by=By.CLASS_NAME, value="title").text == "Title: testbookedit"

        # delete book
        driver.execute_script("document.getElementsByClassName('delete')[2].click()")
        time.sleep(1)

        # test to see if two books are rendered
        test10 = len(driver.find_elements(by=By.CLASS_NAME, value="book")) == 2

        # log out using non-global logout
        driver.execute_script("document.getElementsByClassName('nav-account')[0].click()")
        time.sleep(2)
        driver.execute_script("document.getElementById('sign-out').click()")
        time.sleep(1)

        # test to see if localstorage is empty
        test11 = driver.execute_script("return localStorage.getItem('jwt')") == None
        test12 = driver.execute_script("return localStorage.getItem('bookshelf')") == None

        assert test1 and test2 and test3 and test4 and test5 and test6 and test7 and test8 and test9 and test10 and test11 and test12

    finally:
        driver.quit()


# function to test sorting of the bookshelf page
# login, view, sort, and logout
def test_sort_functionality():
    driver = init_driver()

    try:
        driver.get("http://localhost/")
        driver.execute_script("localStorage.setItem('user', 'test')")
        driver.implicitly_wait(3)

        # navigate to login page
        nav_bar_login = driver.find_element(by=By.CLASS_NAME, value="nav-bar-login")
        nav_bar_login.find_elements(by=By.CLASS_NAME, value="nav-account")[0].click()
        driver.implicitly_wait(1)
        
        # login with test account
        emailInput = driver.find_element(by=By.ID, value="email")
        passwordInput = driver.find_element(by=By.ID, value="password")
        emailInput.send_keys("bookshelf.ai.official@gmail.com")
        passwordInput.send_keys("testpassword")
        driver.execute_async_script("document.getElementById('confirmLogin').click()")
        
        time.sleep(1)
        WebDriverWait(driver, 10).until(EC.alert_is_present())
        time.sleep(2)
        driver.switch_to.alert.accept()

        # test to see if jwt is stored in localstorage
        test1 = driver.execute_script("return localStorage.getItem('jwt')") != None

        # navigate to about then bookshelf page
        time.sleep(3)
        nav_bar_main = driver.find_element(by=By.CLASS_NAME, value="nav-bar-main")
        nav_bar_main.find_elements(by=By.CLASS_NAME, value="nav-btn")[4].click()

        # test to see if selenium driver is on bookshelf page
        test2 = driver.current_url == "http://localhost/bookshelf/"

        time.sleep(2)

        # make sure the first book has title book1
        test3 = driver.find_elements(by=By.CLASS_NAME, value="book")[0].find_element(by=By.CLASS_NAME, value="title").text == "Title: book1"

        # sort by title z -> a
        driver.execute_script("document.getElementById('sort-options').value = 'titleza'")
        driver.execute_script("renderer.render()")
        time.sleep(1)

        # make sure the first book has title randombook
        test4 = driver.find_elements(by=By.CLASS_NAME, value="book")[0].find_element(by=By.CLASS_NAME, value="title").text == "Title: randombook"

        # sort by author a -> z
        driver.execute_script("document.getElementById('sort-options').value = 'authoraz'")
        driver.execute_script("renderer.render()")
        time.sleep(1)

        # make sure the first book has author author1
        test5 = driver.find_elements(by=By.CLASS_NAME, value="book")[0].find_element(by=By.CLASS_NAME, value="author").text == "Author: author1"

        # sort by author z -> a
        driver.execute_script("document.getElementById('sort-options').value = 'authorza'")
        driver.execute_script("renderer.render()")
        time.sleep(1)

        # make sure the first book has author author2
        test6 = driver.find_elements(by=By.CLASS_NAME, value="book")[0].find_element(by=By.CLASS_NAME, value="author").text == "Author: author2"

        # sort by published newest -> oldest
        driver.execute_script("document.getElementById('sort-options').value = 'publishednew'")
        driver.execute_script("renderer.render()")
        time.sleep(1)

        # make sure the first book has published 2024
        test7 = driver.find_elements(by=By.CLASS_NAME, value="book")[0].find_element(by=By.CLASS_NAME, value="published").text == "Published: 2024"

        # sort by published oldest -> newest
        driver.execute_script("document.getElementById('sort-options').value = 'publishedold'")
        driver.execute_script("renderer.render()")
        time.sleep(1)

        # make sure the first book has published 2023
        test8 = driver.find_elements(by=By.CLASS_NAME, value="book")[0].find_element(by=By.CLASS_NAME, value="published").text == "Published: 2023"

        # log out using global logout
        driver.execute_script("document.getElementsByClassName('nav-account')[0].click()")
        time.sleep(2)
        driver.execute_script("document.getElementById('sign-out-all').click()")
        time.sleep(1)

        WebDriverWait(driver, 10).until(EC.alert_is_present())
        driver.switch_to.alert.accept()

        # test to see if localstorage is empty
        test9 = driver.execute_script("return localStorage.getItem('jwt')") == None
        test10 = driver.execute_script("return localStorage.getItem('bookshelf')") == None

        assert test1 and test2 and test3 and test4 and test5 and test6 and test7 and test8 and test9 and test10 

    finally:
        driver.quit()