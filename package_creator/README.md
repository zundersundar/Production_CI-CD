# Heimdall Tools

This is a custom package created to use different modules in a single place.
The wrapper methods are designed in a way to produce the best results to the application.
This helps in code reusability and to improve the performance of application

# Create or modify package

i. Add the new module in heimdall_tools folder

ii. Modify setup.py 

    ..* add dependencies

iii. Create the update package file

    python setup.py sdist

iv. Upload to pypi using twine
s
    twine upload dist/*

#  How to install package

pip install [--upgrade] heimdall_tools