import pandas as pd
import regex as re
from sklearn.feature_extraction import text
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.cluster import KMeans
from sklearn.metrics import adjusted_rand_score
from langdetect import detect

# update this path to reference your CSV input file
INPUT_FILE_PATH = "change/this/path.csv"

# stop words are filtered out before the analysis is run
# common stop words are already excluded in this analysis via the scikit-learn ENGLISH_STOP_WORDS library
# we recommend adding custom stop words relevant the content you're analyzing
# for example, UI stop words might be "claim", "benefits", "unemployment"
CUSTOM_STOP_WORDS = ["claim", "benefits", "unemployment"]

# this number sets how many distinct clusters will be returned in the analysis
TRUE_K = 10

# read the comments data into Pandas data frame
df = pd.read_csv(INPUT_FILE_PATH)
df.dropna(subset=['Comment'], inplace=True)

# filter out non-english comments
def checkEn(x):
    try:
        return detect(x)
    except:
        if re.match("^[0-9 ]+$", x):
            return 'en'
        

df_en = df[df.Comment.apply(checkEn).eq('en')]

# create list for input into clustering model
documents = df_en["Comment"].to_list()

# add custom stop words
stop_words_list = list(text.ENGLISH_STOP_WORDS.union(CUSTOM_STOP_WORDS))

# the n-gram range indicates the length of phrases you're considering in this analysis
# ngram_range (1,3) means that this will return one word, two word, and three word phrases
# this doesn't typically change, but depending on the content you're analyzing, you can increase or decrease the range as needed
vectorizer = TfidfVectorizer(stop_words=stop_words_list, ngram_range=(1,3))
X = vectorizer.fit_transform(documents)

# sklearn K-Means clustering model
# n_clusters uses our TRUE_K value to determine the number of clusters generated
# by setting the random_state variable to (any) integer, this allows us to get consistent results each run
# these values typically do not change
model = KMeans(n_clusters=TRUE_K, init='k-means++', n_init="auto", random_state=42)
model.fit(X)
topic_map = {}
topic_terms = {} 

order_centroids = model.cluster_centers_.argsort()[:, ::-1]
terms = vectorizer.get_feature_names_out()
for i in range(TRUE_K):
    cluster_terms = []
    # this lists out the 10 most representative words for each cluster
    for ind in order_centroids[i, :10]:
        cluster_terms.append(' %s' % terms[ind])
    topic_map[i] = str(i) + "-" + cluster_terms[0].strip()
    topic_terms[i] = str(cluster_terms)

# assign cluster to each query
df['cluster'] = model.predict(vectorizer.transform(df["Comment"]))

# add label to the clusters
df['cluster_label'] = df.cluster.map(topic_map)
df['cluster_top_terms'] = df.cluster.map(topic_terms)

# write comments to excel, one sheet per cluster
with pd.ExcelWriter('output/comment-summary.xlsx') as writer:
    # summary sheet
    header = ['cluster_label', 'cluster_top_terms', 'cluster']
    df.groupby(['cluster_label', 'cluster_top_terms']).count().reset_index().sort_values(by=['cluster_label']).to_excel(writer,sheet_name="Cluster Summary", index=False, header=True, columns=header)

    # all comments
    df.to_excel(writer, sheet_name="All Comments", index=False, header=True)

    # comments broken down by cluster name
    for key, value in topic_map.items():
        df[df['cluster_label'] == value].to_excel(writer, sheet_name=value, index=False)