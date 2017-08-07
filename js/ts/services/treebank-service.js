define(["require", "exports"], function (require, exports) {
    Object.defineProperty(exports, "__esModule", { value: true });
    var TreebankService = (function () {
        function TreebankService(api) {
            this.api = api;
        }
        TreebankService.prototype.getMetadata = function (corpus) {
            var _this = this;
            return new Promise(function (resolve, reject) {
                $.get(_this.api + '/treebank/metadata/' + corpus, function (data) {
                    resolve(data.map(function (item) { return item.field; }));
                });
            });
        };
        return TreebankService;
    }());
    exports.TreebankService = TreebankService;
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoidHJlZWJhbmstc2VydmljZS5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uL3RzL3NlcnZpY2VzL3RyZWViYW5rLXNlcnZpY2UudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7SUFBQTtRQUVJLHlCQUFvQixHQUFXO1lBQVgsUUFBRyxHQUFILEdBQUcsQ0FBUTtRQUMvQixDQUFDO1FBRU0scUNBQVcsR0FBbEIsVUFBbUIsTUFBYztZQUFqQyxpQkFNQztZQUxHLE1BQU0sQ0FBQyxJQUFJLE9BQU8sQ0FBVyxVQUFDLE9BQU8sRUFBRSxNQUFNO2dCQUN6QyxDQUFDLENBQUMsR0FBRyxDQUFDLEtBQUksQ0FBQyxHQUFHLEdBQUcscUJBQXFCLEdBQUcsTUFBTSxFQUFFLFVBQUMsSUFBeUI7b0JBQ3ZFLE9BQU8sQ0FBQyxJQUFJLENBQUMsR0FBRyxDQUFDLFVBQUEsSUFBSSxJQUFJLE9BQUEsSUFBSSxDQUFDLEtBQUssRUFBVixDQUFVLENBQUMsQ0FBQyxDQUFDO2dCQUMxQyxDQUFDLENBQUMsQ0FBQztZQUNQLENBQUMsQ0FBQyxDQUFDO1FBQ1AsQ0FBQztRQUNMLHNCQUFDO0lBQUQsQ0FBQyxBQVpELElBWUM7SUFaWSwwQ0FBZSJ9