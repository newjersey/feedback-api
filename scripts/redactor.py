import pandas as pd

# Regex pattern matches
emailPattern = "([A-Za-z0-9]+[.-_])*[A-Za-z0-9]+@[A-Za-z0-9-]+(\.[A-Z|a-z]{2,})?"
phonePattern = "(\+\d{1,2}\s?)?\(?\d{3}\)?[\s.-]?\d{3}[\s.-]?\d{4}"
namePattern = "(my name is)"
numberPattern = "(\d+[/]?)(?<![1099G|1099 G|1099])"

# Read the exported CSV
df = pd.read_csv("input/ui-comments.csv")
df.dropna(subset=['Comment'], inplace=True)

# Delete full comments that have emails, phones, or name declarations.
df_clean = df[~df.Comment.str.contains(phonePattern + "|" + emailPattern + "|" + namePattern, case=False)]

# Remove all numbers that aren't 1099-G
df_clean['Comment'] = df_clean['Comment'].replace(numberPattern, "", regex=True)

# Output CSV
df_clean.to_csv("input/ui-comments-cleaned.csv", index=False, header=True, encoding='utf-8-sig')

