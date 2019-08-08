## 接口
1.点击区域获取右侧疾病数据
get:http://118.24.119.234:8087/vesal-jiepao-test/v1/app/pathology/getPathologyAndArea?patAreaNo=GKQY01
参数:
 patAreaNo:区域编号


2.获取单个疾病资源,包括底部菜单,图片,摄像机参数等
get:http://118.24.119.234:8087/vesal-jiepao-test/v1/app/pathology/getPathologyRes?patNo=BLCJ001

参数:
 patNo:疾病编号

3.获取搜索下面的推荐疾病
get:http://118.24.119.234:8087/vesal-jiepao-test/v1/app/pathology/getSearchHot?size=6
参数:
size:获取条数