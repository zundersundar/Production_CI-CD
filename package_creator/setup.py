# setup.py

from setuptools import setup, find_packages

packs= find_packages()
print(packs)

setup(
    name='heimdall_tools',
    version='1.2.2',
    packages=find_packages(),
    install_requires=[
        'boto3', #sqs, sns
        'redis', # redis_client.py
        'hvac' #vault
        # Add any other dependencies here
    ],
    author='Robin Thomas',
    author_email='robin@clockhash.com',
    description='Custom package including all modules required for my application',
    long_description=open('README.md').read(),
    long_description_content_type='text/markdown',
    url='https://github.com/your_username/your_package',
    classifiers=[
        'Programming Language :: Python :: 3',
        'License :: OSI Approved :: MIT License',
        'Operating System :: OS Independent',
    ],
    license='MIT',
)
