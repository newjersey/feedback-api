## Instructions

The scripts in this folder can be used to process comments generated via feedback forms. 

When running this locally, the scripts will assume two folders - `input` for data input files, and `output` for the results. Avoid checking these into Github to keep this repository clean. 

These scripts use Python 3. There may be packages you will need to install locally. To do so, use [pip](https://pypi.org/project/pip/).

```
pip3 install <package_name>
```

To run a script, `cd` into the `scripts` folder of the repository, and run the following command. 
```
python3 <script_name>.py
```

## Description of Scripts
* **redactor.py**: This script removes comments that contain phone numbers or email addresses, as well as removes references to specific numbers within comments themselves. 
* **cluster-tool.py**: This script uses the [scikit-learn cluster module](https://scikit-learn.org/stable/modules/clustering.html) to group comments into themes of topics. The `true_k` variable can be adjusted to change the number of clusters generated.  