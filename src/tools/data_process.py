"""
结果数据处理脚本
1.输出数据存储在数据库
2.输出数据存储在本地文件
"""
import sys
import os
import json
import zipfile

from pymongo import MongoClient

#数据库位置
client = MongoClient('127.0.0.1', 27017)
db = client.SteinsServer
collection = db.Data

featureDict = {
    'gpp': 0,
    'npp': 1,
    'nee': 2,
    'co2': 3
}

#本地文件位置  目前仅支持固定站点命名规则的文件结构

#读取数据库内容
def readDbData(instanceId, siteName, date, feature):
    value = ''
    result = collection.find_one({'instanceId': instanceId, 'sitename': siteName})
    yearContent =  result['year']
    yearList = yearContent.splitlines()
    for line in yearList:
        if(line.lstrip().startswith(date)):
            featureList = line.split()
            value = featureList[featureDict[feature] + 1]
            break
    return value


#重构数据 提取对应 单个日期 单个要素的 全站点文件
def refactorData(configDict, date, feature):
    newData = ''
    #遍历站点 提取数据
    for colIndex in range(0, configDict['meta']['spatial']['ncols']):
        for rowIndex in range(0, configDict['meta']['spatial']['nrows']):
            siteName = str(configDict['startLocation'][0] + rowIndex) + '-' + str(configDict['startLocation'][1] + colIndex)
            value = readDbData(configDict['instanceId'], siteName, date, feature)
            newData = newData + value + ' '
        newData = newData + '\n'
        
    return newData

def main():
    #获取配置内容
    configFilePath = sys.argv[1]
    configDict = {}
    with open(configFilePath, 'r') as f:
        configDict = json.load(f)

    #遍历feature  提取并压缩每个feature结果数据
    for feature in configDict['meta']['feature']:
        #生成配置文件index.json
        indexDict = dict(configDict) #copy为浅拷贝 如果要复制一个对象o,它属于内建的类型t,那么可以使用t(o)来获得一个拷贝
        del indexDict['instanceId']
        del indexDict['startLocation']
        indexDict['meta']['feature'] = feature

        configDir = os.path.dirname(configFilePath)
        indexPath = configDir + '\\index.json'
        with open(indexPath, 'w') as f:
            json.dump(indexDict, f)
        #生成结果文件
        for dataName in configDict['elements']['entries']:
            dataPath = configDir + '\\' + dataName
            #暂时从入口名读日期
            date = dataName.replace('.txt', '')
            dataContent = refactorData(configDict, date, feature)
            with open(dataPath, 'w') as f:
                f.write(dataContent)

        #压缩文件
        with zipfile.ZipFile(configDir + '\\' + feature + '.zip', 'w') as zipf:
            zipf.write(indexPath, 'index.json')
            for dataName in configDict['elements']['entries']:
                dataPath = configDir + '\\' + dataName
                zipf.write(dataPath, dataName)

        #删除中间文件
        os.remove(indexPath)
        for dataName in configDict['elements']['entries']:
            dataPath = configDir + '\\' + dataName     
            os.remove(dataPath)   

    return 

if __name__ == "__main__":
    main()