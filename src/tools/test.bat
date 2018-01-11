cd D:
D:
cd D:\Program\ZhongShanModel\Server\src\tools
spark-submit --master local[1] --conf spark.mongodb.input.uri=mongodb://%~1/%~2.Data?readPreference=primaryPreferred --conf spark.mongodb.output.uri=mongodb://%~1/%~2.Data --packages org.mongodb.spark:mongo-spark-connector_2.11:2.2.0 ./run.py