# Game On

这是一个用于追踪 ps4 游戏价格的应用，此为集爬虫和后端API的二合一应用。

# 使用方式

## 配置

在项目根目录新建名为「.env」的文件，并加入你的数据库信息。

请确保你的数据库为 mysql 并包含一个名为「gameon」的数据库。

```
DB_HOST=xxx.xx.xxx.xx
DB_USER=user_name
DB_PASSWORD=your_password
```


## 运行

```
git clone https://github.com/ellhf/gojs
cd gojs
npm install
npm run start
```