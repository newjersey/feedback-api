import pandas as pd

# update this path to reference your CSV input file
INPUT_FILE_PATH = "change/this/path.csv"

# Regex pattern matches
email_pattern = "([A-Za-z0-9]+[.-_])*[A-Za-z0-9]+@[A-Za-z0-9-]+(\.[A-Z|a-z]{2,})?"
phone_pattern = "(\+\d{1,2}\s?)?\(?\d{3}\)?[\s.-]?\d{3}[\s.-]?\d{4}"
name_pattern = "(my name is)"
number_pattern = "(\d+[/]?)(?<![1099G|1099 G|1099])"

# Read the exported CSV
df = pd.read_csv(INPUT_FILE_PATH)
df.dropna(subset=['Comment'], inplace=True)

# Delete full comments that have emails, phones, or name declarations.
df_clean = df[~df.Comment.str.contains(phone_pattern + "|" + email_pattern + "|" + name_pattern, case=False)]

# Remove all numbers that aren't 1099-G
df_clean['Comment'] = df_clean['Comment'].replace(number_pattern, "", regex=True)

# Output CSV into the "input" folder for further analysis
df_clean.to_csv("input/comments-redacted.csv", index=False, header=True, encoding='utf-8-sig')

