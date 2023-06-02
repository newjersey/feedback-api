import pandas as pd
import regex as re
from sklearn.feature_extraction import text
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.cluster import KMeans
from sklearn.metrics import adjusted_rand_score
from langdetect import detect


# read the comments data into Pandas data frame
df = pd.read_csv("input/ui-comments-cleaned.csv")
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
ui_stop_words = list(text.ENGLISH_STOP_WORDS.union(["claim", "benefits", "unemployment"]))

vectorizer = TfidfVectorizer(stop_words=ui_stop_words, ngram_range=(1,3))
X = vectorizer.fit_transform(documents)

# set number of clusters
true_k = 10

# clustering model
model = KMeans(n_clusters=true_k, init='k-means++', max_iter=1000, n_init=42, random_state=42)
model.fit(X)
topic_map = {}
topic_terms = {} 

order_centroids = model.cluster_centers_.argsort()[:, ::-1]
terms = vectorizer.get_feature_names_out()
for i in range(true_k):

    cluster_terms = []
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
    




