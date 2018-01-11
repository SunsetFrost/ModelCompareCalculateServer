"""
IBIS模型并行计算脚本
"""
import os
import subprocess
import shutil
import sys

from pymongo import MongoClient
from pymongo import UpdateOne
from bson.objectid import ObjectId

from pyspark.sql import SparkSession
from pyspark.sql import Row

rootPath = "D:\\Program\\ZhongShanModel\\Server"

#根据配置文件 返回实例id 暂时读配置文件
def getInstanceId(path):
    instanceId = ''
    with open(path, 'r') as f:
        line = f.readline()
        instanceId = line.split(" ")[0]
    return instanceId

#根据配置文件 返回各个输入数据站点名所组成的list        
def getSiteNameList(path):
    siteList = []
    with open(path, 'r') as f:
        line = f.readline()
        childWords = line.split(" ")
        rowStartIndex = childWords[4]
        rowEndIndex = childWords[5]
        columnStartIndex = childWords[6]
        columnEndIndex = childWords[7]

    for rowIndex in range(int(rowStartIndex), int(rowEndIndex) + 1):
        for columnIndex in range(int(columnStartIndex), int(columnEndIndex) + 1):
            siteName = str(rowIndex) + '-' + str(columnIndex)
            siteList.append(siteName)

    return siteList

# def zipdir(path, ziph):
#     for root, dirs, files in os.walk(path):
#         for file in files:
#             ziph.write(os.path.join(root, file), file, zipfile.ZIP_DEFLATED)

#运行模型
def runModel(siteNames):
    resultList = []
    #实例id
    configPath = rootPath + '\\model\\ibis\\model.conf'
    instanceId = getInstanceId(configPath)

    for siteName in list(siteNames):
        modelDir = rootPath + "\\model\\ibis"
        modelExePath = modelDir + "\\IBIS-OptBack.exe"
        instancePath = rootPath + "\\instance\\" + instanceId
        if(os.path.exists(instancePath) == False):
            os.mkdir(instancePath)

        #运行模型
        callReturn = subprocess.call(modelExePath + " " + siteName, cwd = modelDir)

        #读取结果文件内容
        dayFile = instancePath + "\\day_" + siteName + ".txt"
        dayContent = ""
        yearFile = instancePath + "\\year_" + siteName + ".txt"
        yearContent = ""
        if(os.path.exists(dayFile)):
            with open(dayFile, 'r') as f:
                dayContent = f.read()
        else:
            dayContent = "calculate error!"
        if(os.path.exists(yearFile)):
            with open(yearFile, 'r') as f:
                yearContent = f.read()
        else:
            yearContent = "calculate error!"

        resultList.append(Row(siteName, instanceId, dayContent, yearContent))  

        #删除生成的结果文件
        # os.remove(dayFile)
        # os.remove(yearFile)

    return resultList

#更新模型运行状态
def changeInstanceState(instanceId, state):
    client = MongoClient('127.0.0.1', 27017)
    db = client.SteinsServer
    collection = db.Instance
    result = collection.update_one(
        { '_id': ObjectId(instanceId) },
        { 
            '$set': {
                "state": state
            }
        }
    )

def main():
    #配置文件路径
    configPath = rootPath + '\\model\\ibis\\model.conf'
    #站名列表
    siteList = getSiteNameList(configPath)

    #spark 初始化
    spark = SparkSession\
        .builder\
        .appName("ModelCompare")\
        .getOrCreate() 

    #rdd
    rdd = spark.sparkContext.parallelize(siteList, len(siteList))
    map_rdd = rdd.mapPartitions(runModel)
    #结果数据写数据库
    df = spark.createDataFrame(map_rdd, ['sitename', 'instanceId', 'day', 'year'])
    df.write.format("com.mongodb.spark.sql").mode("append").save()

    #更新instance状态
    instanceId = getInstanceId(configPath)
    changeInstanceState(instanceId, 'RUN_SUCCEED')

    spark.stop()

    return

if __name__ == "__main__":
    main()

