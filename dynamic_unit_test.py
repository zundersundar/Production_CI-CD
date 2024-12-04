import unittest
from unit_test import heimdall_tools_test
#This is test of cicd 
class DynamicTests(unittest.TestCase):
  #  def test_sqs_write(self):
  #      heimdall_tools_test.sqs_queue_write_test()

  #  def test_mysql_client(self):
  #      heimdall_tools_test.mysql_client_test()

    def test_redis_client(self):
        heimdall_tools_test.redis_client_test()

   # def test_sns_post(self):
   #     heimdall_tools_test.test_post_to_sns_topic()

   # def test_s3_upload(self):
   #     heimdall_tools_test.test_upload_data_to_s3()

   # def test_s3_read(self):
   #     heimdall_tools_test.test_read_data_from_s3()

if __name__ == "__main__":
    unittest.main()
