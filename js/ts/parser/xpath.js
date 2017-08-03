

define(function(require){
var o=function(k,v,o,l){for(o=o||{},l=k.length;l--;o[k[l]]=v);return o},$V0=[1,8],$V1=[1,10],$V2=[1,12],$V3=[1,15],$V4=[1,19],$V5=[1,20],$V6=[1,14],$V7=[1,23],$V8=[1,24],$V9=[1,34],$Va=[1,28],$Vb=[1,29],$Vc=[1,30],$Vd=[1,31],$Ve=[1,32],$Vf=[1,33],$Vg=[1,16],$Vh=[1,17],$Vi=[1,36],$Vj=[1,37],$Vk=[1,38],$Vl=[1,39],$Vm=[1,40],$Vn=[1,41],$Vo=[1,42],$Vp=[1,43],$Vq=[1,44],$Vr=[1,45],$Vs=[1,46],$Vt=[1,47],$Vu=[1,48],$Vv=[1,49],$Vw=[5,12,16,17,18,19,20,21,22,23,24,25,26,27,28,29,32,41],$Vx=[1,53],$Vy=[5,12,16,17,18,19,20,21,22,23,24,25,26,27,28,29,32,34,36,40,41],$Vz=[2,58],$VA=[1,61],$VB=[1,62],$VC=[1,63],$VD=[1,65],$VE=[5,12,16,17,18,19,20,21,22,23,24,25,26,27,28,29,32,34,36,41],$VF=[30,51,52,53,54,55,56],$VG=[5,12,16,17,18,19,20,21,22,23,24,25,26,27,28,32,41],$VH=[5,12,16,17,18,19,32,41],$VI=[5,12,16,17,18,19,20,21,22,23,32,41],$VJ=[5,12,16,17,18,19,20,21,22,23,24,25,32,41],$VK=[12,32],$VL=[5,12,16,17,18,19,20,21,22,23,24,25,26,27,28,29,32,34,41];
var parser = {trace: function trace() { },
yy: {},
symbols_: {"error":2,"xpath_expr":3,"expr":4,"EOF":5,"base_expr":6,"op_expr":7,"path_expr":8,"filter_expr":9,"hashtag_expr":10,"LPAREN":11,"RPAREN":12,"func_call":13,"VAR":14,"literal":15,"OR":16,"AND":17,"EQ":18,"NEQ":19,"LT":20,"LTE":21,"GT":22,"GTE":23,"PLUS":24,"MINUS":25,"MULT":26,"DIV":27,"MOD":28,"UNION":29,"QNAME":30,"arg_list":31,"COMMA":32,"loc_path":33,"SLASH":34,"rel_loc_path":35,"DBL_SLASH":36,"predicate":37,"HASH":38,"hashtag_path":39,"LBRACK":40,"RBRACK":41,"step":42,"step_unabbr":43,"DOT":44,"DBL_DOT":45,"step_body":46,"node_test":47,"axis_specifier":48,"DBL_COLON":49,"AT":50,"WILDCARD":51,"NSWILDCARD":52,"NODETYPE_NODE":53,"NODETYPE_TEXT":54,"NODETYPE_COMMENT":55,"NODETYPE_PROCINSTR":56,"STR":57,"NUM":58,"$accept":0,"$end":1},
terminals_: {2:"error",5:"EOF",11:"LPAREN",12:"RPAREN",14:"VAR",16:"OR",17:"AND",18:"EQ",19:"NEQ",20:"LT",21:"LTE",22:"GT",23:"GTE",24:"PLUS",25:"MINUS",26:"MULT",27:"DIV",28:"MOD",29:"UNION",30:"QNAME",32:"COMMA",34:"SLASH",36:"DBL_SLASH",38:"HASH",40:"LBRACK",41:"RBRACK",44:"DOT",45:"DBL_DOT",49:"DBL_COLON",50:"AT",51:"WILDCARD",52:"NSWILDCARD",53:"NODETYPE_NODE",54:"NODETYPE_TEXT",55:"NODETYPE_COMMENT",56:"NODETYPE_PROCINSTR",57:"STR",58:"NUM"},
productions_: [0,[3,2],[4,1],[4,1],[4,1],[4,1],[4,1],[6,3],[6,1],[6,1],[6,1],[7,3],[7,3],[7,3],[7,3],[7,3],[7,3],[7,3],[7,3],[7,3],[7,3],[7,3],[7,3],[7,3],[7,2],[7,3],[13,4],[13,3],[31,3],[31,1],[8,1],[8,3],[8,3],[8,3],[8,3],[9,2],[9,2],[10,4],[10,2],[39,1],[39,3],[37,3],[33,1],[33,2],[33,2],[33,1],[35,1],[35,3],[35,3],[42,1],[42,1],[42,1],[43,2],[43,1],[46,1],[46,2],[48,2],[48,1],[47,1],[47,1],[47,1],[47,3],[47,3],[47,3],[47,3],[47,4],[15,1],[15,1]],
performAction: function anonymous(yytext, yyleng, yylineno, yy, yystate /* action[1] */, $$ /* vstack */, _$ /* lstack */) {
/* this == yyval */

var $0 = $$.length - 1;
switch (yystate) {
case 1:
 return $$[$0-1]; 
break;
case 2: case 3: case 4: case 5: case 6:
  this.$ = $$[$0]; 
break;
case 7:
 $$[$0-1].parens = true; this.$ = $$[$0-1]; 
break;
case 9:
 this.$ = new yy.xpathModels.XPathVariableReference($$[$0]); 
break;
case 11:
 this.$ = new yy.xpathModels.XPathBoolExpr({"type": "or", "left": $$[$0-2], "right": $$[$0]}); 
break;
case 12:
 this.$ = new yy.xpathModels.XPathBoolExpr({"type": "and", "left": $$[$0-2], "right": $$[$0]}); 
break;
case 13:
 this.$ = new yy.xpathModels.XPathEqExpr({"type": "==", "left": $$[$0-2], "right": $$[$0]}); 
break;
case 14:
 this.$ = new yy.xpathModels.XPathEqExpr({"type": "!=", "left": $$[$0-2], "right": $$[$0]}); 
break;
case 15:
 this.$ = new yy.xpathModels.XPathCmpExpr({"type": "<", "left":$$[$0-2], "right": $$[$0]}); 
break;
case 16:
 this.$ = new yy.xpathModels.XPathCmpExpr({"type": "<=", "left":$$[$0-2], "right": $$[$0]}); 
break;
case 17:
 this.$ = new yy.xpathModels.XPathCmpExpr({"type": ">", "left":$$[$0-2], "right": $$[$0]}); 
break;
case 18:
 this.$ = new yy.xpathModels.XPathCmpExpr({"type": ">=", "left":$$[$0-2], "right": $$[$0]}); 
break;
case 19:
 this.$ = new yy.xpathModels.XPathArithExpr({"type": "+", "left":$$[$0-2], "right": $$[$0]}); 
break;
case 20:
 this.$ = new yy.xpathModels.XPathArithExpr({"type": "-", "left":$$[$0-2], "right": $$[$0]}); 
break;
case 21:
 this.$ = new yy.xpathModels.XPathArithExpr({"type": "*", "left":$$[$0-2], "right": $$[$0]}); 
break;
case 22:
 this.$ = new yy.xpathModels.XPathArithExpr({"type": "/", "left":$$[$0-2], "right": $$[$0]}); 
break;
case 23:
 this.$ = new yy.xpathModels.XPathArithExpr({"type": "%", "left":$$[$0-2], "right": $$[$0]}); 
break;
case 24:
 this.$ = new yy.xpathModels.XPathNumNegExpr({"type": "num-neg", "value":$$[$0]}); 
break;
case 25:
 this.$ = new yy.xpathModels.XPathUnionExpr({"type": "union", "left":$$[$0-2], "right": $$[$0]}); 
break;
case 26:
 this.$ = new yy.xpathModels.XPathFuncExpr({id: $$[$0-3], args: $$[$0-1]}); 
break;
case 27:
 this.$ = new yy.xpathModels.XPathFuncExpr({id: $$[$0-2], args: []}); 
break;
case 28:
 var args = $$[$0-2];
                                      args.push($$[$0]);
                                      this.$ = args; 
break;
case 29:
 this.$ = [$$[$0]]; 
break;
case 31:
 this.$ = new yy.xpathModels.XPathPathExpr({
                                                                    initialContext: yy.xpathModels.XPathInitialContextEnum.EXPR,
                                                                    filter: $$[$0-2], steps: $$[$0]}); 
break;
case 32:
 var steps = $$[$0];
                                                      steps.splice(0, 0, new yy.xpathModels.XPathStep({
                                                                                axis: yy.xpathModels.XPathAxisEnum.DESCENDANT_OR_SELF, 
                                                                                test: yy.xpathModels.XPathTestEnum.TYPE_NODE}));
                                                      this.$ = new yy.xpathModels.XPathPathExpr({
                                                                    initialContext: yy.xpathModels.XPathInitialContextEnum.EXPR,
                                                                    filter: $$[$0-2], steps: steps}); 
break;
case 33:
 // could eliminate filterExpr wrapper, but this makes tests pass as-is
                                                      var filterExpr = new yy.xpathModels.XPathFilterExpr({expr: $$[$0-2]});
                                                      this.$ = new yy.xpathModels.XPathPathExpr({
                                                                    initialContext: yy.xpathModels.XPathInitialContextEnum.EXPR,
                                                                    filter: filterExpr, steps: $$[$0]}); 
break;
case 34:
 var steps = $$[$0];
                                                      // could eliminate filterExpr wrapper, but this makes tests pass as-is
                                                      var filterExpr = new yy.xpathModels.XPathFilterExpr({expr: $$[$0-2]});
                                                      steps.splice(0, 0, new yy.xpathModels.XPathStep({
                                                                                axis: yy.xpathModels.XPathAxisEnum.DESCENDANT_OR_SELF, 
                                                                                test: yy.xpathModels.XPathTestEnum.TYPE_NODE}));
                                                      this.$ = new yy.xpathModels.XPathPathExpr({
                                                                    initialContext: yy.xpathModels.XPathInitialContextEnum.EXPR,
                                                                    filter: filterExpr, steps: steps}); 
break;
case 35:
 this.$ = new yy.xpathModels.XPathFilterExpr({expr: $$[$0-1], predicates: [$$[$0]]}); 
break;
case 36:
 var filterExpr = $$[$0-1];
                                        filterExpr.predicates.push($$[$0]);
                                        this.$ = filterExpr; 
break;
case 37:
 this.$ = new yy.xpathModels.HashtagExpr({initialContext: yy.xpathModels.XPathInitialContextEnum.HASHTAG,
                                                                      namespace: $$[$0-2],
                                                                      steps: $$[$0]}); 
break;
case 38:
 this.$ = new yy.xpathModels.HashtagExpr({initialContext: yy.xpathModels.XPathInitialContextEnum.HASHTAG,
                                                                      namespace: $$[$0],
                                                                      steps: []}); 
break;
case 39:
this.$ = [$$[$0]];
break;
case 40:
var path = $$[$0-2]; path.push($$[$0]); this.$ = path;
break;
case 41:
 this.$ = $$[$0-1]; 
break;
case 42:
 this.$ = new yy.xpathModels.XPathPathExpr({initialContext: yy.xpathModels.XPathInitialContextEnum.RELATIVE,
                                                                      steps: $$[$0]}); 
break;
case 43:
 this.$ = new yy.xpathModels.XPathPathExpr({initialContext: yy.xpathModels.XPathInitialContextEnum.ROOT,
                                                                      steps: $$[$0]}); 
break;
case 44:
 var steps = $$[$0];
                                              // insert descendant step into beginning
                                              steps.splice(0, 0, new yy.xpathModels.XPathStep({axis: yy.xpathModels.XPathAxisEnum.DESCENDANT_OR_SELF, 
                                                                                test: yy.xpathModels.XPathTestEnum.TYPE_NODE}));
                                              this.$ = new yy.xpathModels.XPathPathExpr({initialContext: yy.xpathModels.XPathInitialContextEnum.ROOT,
                                                                      steps: steps}); 
break;
case 45:
 this.$ = new yy.xpathModels.XPathPathExpr({initialContext: yy.xpathModels.XPathInitialContextEnum.ROOT,
                                                              steps: []});
break;
case 46:
 this.$ = [$$[$0]];
break;
case 47:
 var path = $$[$0-2];
                                            path.push($$[$0]);
                                            this.$ = path; 
break;
case 48:
 var path = $$[$0-2];
                                            path.push(new yy.xpathModels.XPathStep({axis: yy.xpathModels.XPathAxisEnum.DESCENDANT_OR_SELF, 
                                                                     test: yy.xpathModels.XPathTestEnum.TYPE_NODE}));
                                            path.push($$[$0]);
                                            this.$ = path; 
break;
case 49: case 53:
 this.$ = $$[$0]; 
break;
case 50:
 this.$ = new yy.xpathModels.XPathStep({axis: yy.xpathModels.XPathAxisEnum.SELF, 
                                                          test: yy.xpathModels.XPathTestEnum.TYPE_NODE}); 
break;
case 51:
 this.$ = new yy.xpathModels.XPathStep({axis: yy.xpathModels.XPathAxisEnum.PARENT, 
                                                          test: yy.xpathModels.XPathTestEnum.TYPE_NODE}); 
break;
case 52:
 var step = $$[$0-1];
                                            step.predicates.push($$[$0]);
                                            this.$ = step; 
break;
case 54:
 var nodeTest = $$[$0]; // temporary dict with appropriate args
                                          nodeTest.axis = yy.xpathModels.XPathAxisEnum.CHILD;
                                          this.$ = new yy.xpathModels.XPathStep(nodeTest); 
break;
case 55:
 var nodeTest = $$[$0];  // temporary dict with appropriate args
                                          nodeTest.axis = $$[$0-1]; // add axis
                                          this.$ = new yy.xpathModels.XPathStep(nodeTest); 
break;
case 56:
 this.$ = yy.xpathModels.validateAxisName($$[$0-1]); 
break;
case 57:
 this.$ = yy.xpathModels.XPathAxisEnum.ATTRIBUTE; 
break;
case 58:
 this.$ = {"test": yy.xpathModels.XPathTestEnum.NAME, "name": $$[$0]}; 
break;
case 59:
 this.$ = {"test": yy.xpathModels.XPathTestEnum.NAME_WILDCARD}; 
break;
case 60:
 this.$ = {"test": yy.xpathModels.XPathTestEnum.NAMESPACE_WILDCARD, "namespace": $$[$0]}; 
break;
case 61:
 this.$ = {"test": yy.xpathModels.XPathTestEnum.TYPE_NODE}; 
break;
case 62:
 this.$ = {"test": yy.xpathModels.XPathTestEnum.TYPE_TEXT}; 
break;
case 63:
 this.$ = {"test": yy.xpathModels.XPathTestEnum.TYPE_COMMENT}; 
break;
case 64:
 this.$ = {"test": yy.xpathModels.XPathTestEnum.TYPE_PROCESSING_INSTRUCTION, "literal": null}; 
break;
case 65:
 this.$ = {"test": yy.xpathModels.XPathTestEnum.TYPE_PROCESSING_INSTRUCTION, "literal": $$[$0-1]}; 
break;
case 66:
 this.$ = new yy.xpathModels.XPathStringLiteral($$[$0]); 
break;
case 67:
 this.$ = new yy.xpathModels.XPathNumericLiteral($$[$0]); 
break;
}
},
table: [{3:1,4:2,6:3,7:4,8:5,9:6,10:7,11:$V0,13:9,14:$V1,15:11,25:$V2,30:$V3,33:13,34:$V4,35:18,36:$V5,38:$V6,42:21,43:22,44:$V7,45:$V8,46:25,47:26,48:27,50:$V9,51:$Va,52:$Vb,53:$Vc,54:$Vd,55:$Ve,56:$Vf,57:$Vg,58:$Vh},{1:[3]},{5:[1,35],16:$Vi,17:$Vj,18:$Vk,19:$Vl,20:$Vm,21:$Vn,22:$Vo,23:$Vp,24:$Vq,25:$Vr,26:$Vs,27:$Vt,28:$Vu,29:$Vv},o($Vw,[2,2],{37:52,34:[1,50],36:[1,51],40:$Vx}),o($Vw,[2,3]),o($Vw,[2,4]),o($Vw,[2,5],{37:56,34:[1,54],36:[1,55],40:$Vx}),o($Vw,[2,6]),{4:57,6:3,7:4,8:5,9:6,10:7,11:$V0,13:9,14:$V1,15:11,25:$V2,30:$V3,33:13,34:$V4,35:18,36:$V5,38:$V6,42:21,43:22,44:$V7,45:$V8,46:25,47:26,48:27,50:$V9,51:$Va,52:$Vb,53:$Vc,54:$Vd,55:$Ve,56:$Vf,57:$Vg,58:$Vh},o($Vy,[2,8]),o($Vy,[2,9]),o($Vy,[2,10]),{4:58,6:3,7:4,8:5,9:6,10:7,11:$V0,13:9,14:$V1,15:11,25:$V2,30:$V3,33:13,34:$V4,35:18,36:$V5,38:$V6,42:21,43:22,44:$V7,45:$V8,46:25,47:26,48:27,50:$V9,51:$Va,52:$Vb,53:$Vc,54:$Vd,55:$Ve,56:$Vf,57:$Vg,58:$Vh},o($Vw,[2,30]),{30:[1,59]},o($Vy,$Vz,{11:[1,60],49:$VA}),o($Vy,[2,66]),o($Vy,[2,67]),o($Vw,[2,42],{34:$VB,36:$VC}),o($Vw,[2,45],{42:21,43:22,46:25,47:26,48:27,35:64,30:$VD,44:$V7,45:$V8,50:$V9,51:$Va,52:$Vb,53:$Vc,54:$Vd,55:$Ve,56:$Vf}),{30:$VD,35:66,42:21,43:22,44:$V7,45:$V8,46:25,47:26,48:27,50:$V9,51:$Va,52:$Vb,53:$Vc,54:$Vd,55:$Ve,56:$Vf},o($VE,[2,46]),o($VE,[2,49],{37:67,40:$Vx}),o($VE,[2,50]),o($VE,[2,51]),o($Vy,[2,53]),o($Vy,[2,54]),{30:[1,69],47:68,51:$Va,52:$Vb,53:$Vc,54:$Vd,55:$Ve,56:$Vf},o($Vy,[2,59]),o($Vy,[2,60]),{11:[1,70]},{11:[1,71]},{11:[1,72]},{11:[1,73]},o($VF,[2,57]),{1:[2,1]},{4:74,6:3,7:4,8:5,9:6,10:7,11:$V0,13:9,14:$V1,15:11,25:$V2,30:$V3,33:13,34:$V4,35:18,36:$V5,38:$V6,42:21,43:22,44:$V7,45:$V8,46:25,47:26,48:27,50:$V9,51:$Va,52:$Vb,53:$Vc,54:$Vd,55:$Ve,56:$Vf,57:$Vg,58:$Vh},{4:75,6:3,7:4,8:5,9:6,10:7,11:$V0,13:9,14:$V1,15:11,25:$V2,30:$V3,33:13,34:$V4,35:18,36:$V5,38:$V6,42:21,43:22,44:$V7,45:$V8,46:25,47:26,48:27,50:$V9,51:$Va,52:$Vb,53:$Vc,54:$Vd,55:$Ve,56:$Vf,57:$Vg,58:$Vh},{4:76,6:3,7:4,8:5,9:6,10:7,11:$V0,13:9,14:$V1,15:11,25:$V2,30:$V3,33:13,34:$V4,35:18,36:$V5,38:$V6,42:21,43:22,44:$V7,45:$V8,46:25,47:26,48:27,50:$V9,51:$Va,52:$Vb,53:$Vc,54:$Vd,55:$Ve,56:$Vf,57:$Vg,58:$Vh},{4:77,6:3,7:4,8:5,9:6,10:7,11:$V0,13:9,14:$V1,15:11,25:$V2,30:$V3,33:13,34:$V4,35:18,36:$V5,38:$V6,42:21,43:22,44:$V7,45:$V8,46:25,47:26,48:27,50:$V9,51:$Va,52:$Vb,53:$Vc,54:$Vd,55:$Ve,56:$Vf,57:$Vg,58:$Vh},{4:78,6:3,7:4,8:5,9:6,10:7,11:$V0,13:9,14:$V1,15:11,25:$V2,30:$V3,33:13,34:$V4,35:18,36:$V5,38:$V6,42:21,43:22,44:$V7,45:$V8,46:25,47:26,48:27,50:$V9,51:$Va,52:$Vb,53:$Vc,54:$Vd,55:$Ve,56:$Vf,57:$Vg,58:$Vh},{4:79,6:3,7:4,8:5,9:6,10:7,11:$V0,13:9,14:$V1,15:11,25:$V2,30:$V3,33:13,34:$V4,35:18,36:$V5,38:$V6,42:21,43:22,44:$V7,45:$V8,46:25,47:26,48:27,50:$V9,51:$Va,52:$Vb,53:$Vc,54:$Vd,55:$Ve,56:$Vf,57:$Vg,58:$Vh},{4:80,6:3,7:4,8:5,9:6,10:7,11:$V0,13:9,14:$V1,15:11,25:$V2,30:$V3,33:13,34:$V4,35:18,36:$V5,38:$V6,42:21,43:22,44:$V7,45:$V8,46:25,47:26,48:27,50:$V9,51:$Va,52:$Vb,53:$Vc,54:$Vd,55:$Ve,56:$Vf,57:$Vg,58:$Vh},{4:81,6:3,7:4,8:5,9:6,10:7,11:$V0,13:9,14:$V1,15:11,25:$V2,30:$V3,33:13,34:$V4,35:18,36:$V5,38:$V6,42:21,43:22,44:$V7,45:$V8,46:25,47:26,48:27,50:$V9,51:$Va,52:$Vb,53:$Vc,54:$Vd,55:$Ve,56:$Vf,57:$Vg,58:$Vh},{4:82,6:3,7:4,8:5,9:6,10:7,11:$V0,13:9,14:$V1,15:11,25:$V2,30:$V3,33:13,34:$V4,35:18,36:$V5,38:$V6,42:21,43:22,44:$V7,45:$V8,46:25,47:26,48:27,50:$V9,51:$Va,52:$Vb,53:$Vc,54:$Vd,55:$Ve,56:$Vf,57:$Vg,58:$Vh},{4:83,6:3,7:4,8:5,9:6,10:7,11:$V0,13:9,14:$V1,15:11,25:$V2,30:$V3,33:13,34:$V4,35:18,36:$V5,38:$V6,42:21,43:22,44:$V7,45:$V8,46:25,47:26,48:27,50:$V9,51:$Va,52:$Vb,53:$Vc,54:$Vd,55:$Ve,56:$Vf,57:$Vg,58:$Vh},{4:84,6:3,7:4,8:5,9:6,10:7,11:$V0,13:9,14:$V1,15:11,25:$V2,30:$V3,33:13,34:$V4,35:18,36:$V5,38:$V6,42:21,43:22,44:$V7,45:$V8,46:25,47:26,48:27,50:$V9,51:$Va,52:$Vb,53:$Vc,54:$Vd,55:$Ve,56:$Vf,57:$Vg,58:$Vh},{4:85,6:3,7:4,8:5,9:6,10:7,11:$V0,13:9,14:$V1,15:11,25:$V2,30:$V3,33:13,34:$V4,35:18,36:$V5,38:$V6,42:21,43:22,44:$V7,45:$V8,46:25,47:26,48:27,50:$V9,51:$Va,52:$Vb,53:$Vc,54:$Vd,55:$Ve,56:$Vf,57:$Vg,58:$Vh},{4:86,6:3,7:4,8:5,9:6,10:7,11:$V0,13:9,14:$V1,15:11,25:$V2,30:$V3,33:13,34:$V4,35:18,36:$V5,38:$V6,42:21,43:22,44:$V7,45:$V8,46:25,47:26,48:27,50:$V9,51:$Va,52:$Vb,53:$Vc,54:$Vd,55:$Ve,56:$Vf,57:$Vg,58:$Vh},{4:87,6:3,7:4,8:5,9:6,10:7,11:$V0,13:9,14:$V1,15:11,25:$V2,30:$V3,33:13,34:$V4,35:18,36:$V5,38:$V6,42:21,43:22,44:$V7,45:$V8,46:25,47:26,48:27,50:$V9,51:$Va,52:$Vb,53:$Vc,54:$Vd,55:$Ve,56:$Vf,57:$Vg,58:$Vh},{30:$VD,35:88,42:21,43:22,44:$V7,45:$V8,46:25,47:26,48:27,50:$V9,51:$Va,52:$Vb,53:$Vc,54:$Vd,55:$Ve,56:$Vf},{30:$VD,35:89,42:21,43:22,44:$V7,45:$V8,46:25,47:26,48:27,50:$V9,51:$Va,52:$Vb,53:$Vc,54:$Vd,55:$Ve,56:$Vf},o($Vy,[2,35]),{4:90,6:3,7:4,8:5,9:6,10:7,11:$V0,13:9,14:$V1,15:11,25:$V2,30:$V3,33:13,34:$V4,35:18,36:$V5,38:$V6,42:21,43:22,44:$V7,45:$V8,46:25,47:26,48:27,50:$V9,51:$Va,52:$Vb,53:$Vc,54:$Vd,55:$Ve,56:$Vf,57:$Vg,58:$Vh},{30:$VD,35:91,42:21,43:22,44:$V7,45:$V8,46:25,47:26,48:27,50:$V9,51:$Va,52:$Vb,53:$Vc,54:$Vd,55:$Ve,56:$Vf},{30:$VD,35:92,42:21,43:22,44:$V7,45:$V8,46:25,47:26,48:27,50:$V9,51:$Va,52:$Vb,53:$Vc,54:$Vd,55:$Ve,56:$Vf},o($Vy,[2,36]),{12:[1,93],16:$Vi,17:$Vj,18:$Vk,19:$Vl,20:$Vm,21:$Vn,22:$Vo,23:$Vp,24:$Vq,25:$Vr,26:$Vs,27:$Vt,28:$Vu,29:$Vv},o($VG,[2,24],{29:$Vv}),o($Vw,[2,38],{34:[1,94]}),{4:97,6:3,7:4,8:5,9:6,10:7,11:$V0,12:[1,96],13:9,14:$V1,15:11,25:$V2,30:$V3,31:95,33:13,34:$V4,35:18,36:$V5,38:$V6,42:21,43:22,44:$V7,45:$V8,46:25,47:26,48:27,50:$V9,51:$Va,52:$Vb,53:$Vc,54:$Vd,55:$Ve,56:$Vf,57:$Vg,58:$Vh},o($VF,[2,56]),{30:$VD,42:98,43:22,44:$V7,45:$V8,46:25,47:26,48:27,50:$V9,51:$Va,52:$Vb,53:$Vc,54:$Vd,55:$Ve,56:$Vf},{30:$VD,42:99,43:22,44:$V7,45:$V8,46:25,47:26,48:27,50:$V9,51:$Va,52:$Vb,53:$Vc,54:$Vd,55:$Ve,56:$Vf},o($Vw,[2,43],{34:$VB,36:$VC}),o($Vy,$Vz,{49:$VA}),o($Vw,[2,44],{34:$VB,36:$VC}),o($Vy,[2,52]),o($Vy,[2,55]),o($Vy,$Vz),{12:[1,100]},{12:[1,101]},{12:[1,102]},{12:[1,103],57:[1,104]},o([5,12,32,41],[2,11],{16:$Vi,17:$Vj,18:$Vk,19:$Vl,20:$Vm,21:$Vn,22:$Vo,23:$Vp,24:$Vq,25:$Vr,26:$Vs,27:$Vt,28:$Vu,29:$Vv}),o([5,12,16,32,41],[2,12],{17:$Vj,18:$Vk,19:$Vl,20:$Vm,21:$Vn,22:$Vo,23:$Vp,24:$Vq,25:$Vr,26:$Vs,27:$Vt,28:$Vu,29:$Vv}),o($VH,[2,13],{20:$Vm,21:$Vn,22:$Vo,23:$Vp,24:$Vq,25:$Vr,26:$Vs,27:$Vt,28:$Vu,29:$Vv}),o($VH,[2,14],{20:$Vm,21:$Vn,22:$Vo,23:$Vp,24:$Vq,25:$Vr,26:$Vs,27:$Vt,28:$Vu,29:$Vv}),o($VI,[2,15],{24:$Vq,25:$Vr,26:$Vs,27:$Vt,28:$Vu,29:$Vv}),o($VI,[2,16],{24:$Vq,25:$Vr,26:$Vs,27:$Vt,28:$Vu,29:$Vv}),o($VI,[2,17],{24:$Vq,25:$Vr,26:$Vs,27:$Vt,28:$Vu,29:$Vv}),o($VI,[2,18],{24:$Vq,25:$Vr,26:$Vs,27:$Vt,28:$Vu,29:$Vv}),o($VJ,[2,19],{26:$Vs,27:$Vt,28:$Vu,29:$Vv}),o($VJ,[2,20],{26:$Vs,27:$Vt,28:$Vu,29:$Vv}),o($VG,[2,21],{29:$Vv}),o($VG,[2,22],{29:$Vv}),o($VG,[2,23],{29:$Vv}),o($Vw,[2,25]),o($Vw,[2,33],{34:$VB,36:$VC}),o($Vw,[2,34],{34:$VB,36:$VC}),{16:$Vi,17:$Vj,18:$Vk,19:$Vl,20:$Vm,21:$Vn,22:$Vo,23:$Vp,24:$Vq,25:$Vr,26:$Vs,27:$Vt,28:$Vu,29:$Vv,41:[1,105]},o($Vw,[2,31],{34:$VB,36:$VC}),o($Vw,[2,32],{34:$VB,36:$VC}),o($Vy,[2,7]),{30:[1,107],39:106},{12:[1,108],32:[1,109]},o($Vy,[2,27]),o($VK,[2,29],{16:$Vi,17:$Vj,18:$Vk,19:$Vl,20:$Vm,21:$Vn,22:$Vo,23:$Vp,24:$Vq,25:$Vr,26:$Vs,27:$Vt,28:$Vu,29:$Vv}),o($VE,[2,47]),o($VE,[2,48]),o($Vy,[2,61]),o($Vy,[2,62]),o($Vy,[2,63]),o($Vy,[2,64]),{12:[1,110]},o($Vy,[2,41]),o($Vw,[2,37],{34:[1,111]}),o($VL,[2,39]),o($Vy,[2,26]),{4:112,6:3,7:4,8:5,9:6,10:7,11:$V0,13:9,14:$V1,15:11,25:$V2,30:$V3,33:13,34:$V4,35:18,36:$V5,38:$V6,42:21,43:22,44:$V7,45:$V8,46:25,47:26,48:27,50:$V9,51:$Va,52:$Vb,53:$Vc,54:$Vd,55:$Ve,56:$Vf,57:$Vg,58:$Vh},o($Vy,[2,65]),{30:[1,113]},o($VK,[2,28],{16:$Vi,17:$Vj,18:$Vk,19:$Vl,20:$Vm,21:$Vn,22:$Vo,23:$Vp,24:$Vq,25:$Vr,26:$Vs,27:$Vt,28:$Vu,29:$Vv}),o($VL,[2,40])],
defaultActions: {35:[2,1]},
parseError: function parseError(str, hash) {
    if (hash.recoverable) {
        this.trace(str);
    } else {
        function _parseError (msg, hash) {
            this.message = msg;
            this.hash = hash;
        }
        _parseError.prototype = Error;

        throw new _parseError(str, hash);
    }
},
parse: function parse(input) {
    var self = this, stack = [0], tstack = [], vstack = [null], lstack = [], table = this.table, yytext = '', yylineno = 0, yyleng = 0, recovering = 0, TERROR = 2, EOF = 1;
    var args = lstack.slice.call(arguments, 1);
    var lexer = Object.create(this.lexer);
    var sharedState = { yy: {} };
    for (var k in this.yy) {
        if (Object.prototype.hasOwnProperty.call(this.yy, k)) {
            sharedState.yy[k] = this.yy[k];
        }
    }
    lexer.setInput(input, sharedState.yy);
    sharedState.yy.lexer = lexer;
    sharedState.yy.parser = this;
    if (typeof lexer.yylloc == 'undefined') {
        lexer.yylloc = {};
    }
    var yyloc = lexer.yylloc;
    lstack.push(yyloc);
    var ranges = lexer.options && lexer.options.ranges;
    if (typeof sharedState.yy.parseError === 'function') {
        this.parseError = sharedState.yy.parseError;
    } else {
        this.parseError = Object.getPrototypeOf(this).parseError;
    }
    function popStack(n) {
        stack.length = stack.length - 2 * n;
        vstack.length = vstack.length - n;
        lstack.length = lstack.length - n;
    }
    _token_stack:
        var lex = function () {
            var token;
            token = lexer.lex() || EOF;
            if (typeof token !== 'number') {
                token = self.symbols_[token] || token;
            }
            return token;
        };
    var symbol, preErrorSymbol, state, action, a, r, yyval = {}, p, len, newState, expected;
    while (true) {
        state = stack[stack.length - 1];
        if (this.defaultActions[state]) {
            action = this.defaultActions[state];
        } else {
            if (symbol === null || typeof symbol == 'undefined') {
                symbol = lex();
            }
            action = table[state] && table[state][symbol];
        }
                    if (typeof action === 'undefined' || !action.length || !action[0]) {
                var errStr = '';
                expected = [];
                for (p in table[state]) {
                    if (this.terminals_[p] && p > TERROR) {
                        expected.push('\'' + this.terminals_[p] + '\'');
                    }
                }
                if (lexer.showPosition) {
                    errStr = 'Parse error on line ' + (yylineno + 1) + ':\n' + lexer.showPosition() + '\nExpecting ' + expected.join(', ') + ', got \'' + (this.terminals_[symbol] || symbol) + '\'';
                } else {
                    errStr = 'Parse error on line ' + (yylineno + 1) + ': Unexpected ' + (symbol == EOF ? 'end of input' : '\'' + (this.terminals_[symbol] || symbol) + '\'');
                }
                this.parseError(errStr, {
                    text: lexer.match,
                    token: this.terminals_[symbol] || symbol,
                    line: lexer.yylineno,
                    loc: yyloc,
                    expected: expected
                });
            }
        if (action[0] instanceof Array && action.length > 1) {
            throw new Error('Parse Error: multiple actions possible at state: ' + state + ', token: ' + symbol);
        }
        switch (action[0]) {
        case 1:
            stack.push(symbol);
            vstack.push(lexer.yytext);
            lstack.push(lexer.yylloc);
            stack.push(action[1]);
            symbol = null;
            if (!preErrorSymbol) {
                yyleng = lexer.yyleng;
                yytext = lexer.yytext;
                yylineno = lexer.yylineno;
                yyloc = lexer.yylloc;
                if (recovering > 0) {
                    recovering--;
                }
            } else {
                symbol = preErrorSymbol;
                preErrorSymbol = null;
            }
            break;
        case 2:
            len = this.productions_[action[1]][1];
            yyval.$ = vstack[vstack.length - len];
            yyval._$ = {
                first_line: lstack[lstack.length - (len || 1)].first_line,
                last_line: lstack[lstack.length - 1].last_line,
                first_column: lstack[lstack.length - (len || 1)].first_column,
                last_column: lstack[lstack.length - 1].last_column
            };
            if (ranges) {
                yyval._$.range = [
                    lstack[lstack.length - (len || 1)].range[0],
                    lstack[lstack.length - 1].range[1]
                ];
            }
            r = this.performAction.apply(yyval, [
                yytext,
                yyleng,
                yylineno,
                sharedState.yy,
                action[1],
                vstack,
                lstack
            ].concat(args));
            if (typeof r !== 'undefined') {
                return r;
            }
            if (len) {
                stack = stack.slice(0, -1 * len * 2);
                vstack = vstack.slice(0, -1 * len);
                lstack = lstack.slice(0, -1 * len);
            }
            stack.push(this.productions_[action[1]][0]);
            vstack.push(yyval.$);
            lstack.push(yyval._$);
            newState = table[stack[stack.length - 2]][stack[stack.length - 1]];
            stack.push(newState);
            break;
        case 3:
            return true;
        }
    }
    return true;
}};

/* generated by jison-lex 0.3.4 */
var lexer = (function(){
var lexer = ({

EOF:1,

parseError:function parseError(str, hash) {
        if (this.yy.parser) {
            this.yy.parser.parseError(str, hash);
        } else {
            throw new Error(str);
        }
    },

// resets the lexer, sets new input
setInput:function (input, yy) {
        this.yy = yy || this.yy || {};
        this._input = input;
        this._more = this._backtrack = this.done = false;
        this.yylineno = this.yyleng = 0;
        this.yytext = this.matched = this.match = '';
        this.conditionStack = ['INITIAL'];
        this.yylloc = {
            first_line: 1,
            first_column: 0,
            last_line: 1,
            last_column: 0
        };
        if (this.options.ranges) {
            this.yylloc.range = [0,0];
        }
        this.offset = 0;
        return this;
    },

// consumes and returns one char from the input
input:function () {
        var ch = this._input[0];
        this.yytext += ch;
        this.yyleng++;
        this.offset++;
        this.match += ch;
        this.matched += ch;
        var lines = ch.match(/(?:\r\n?|\n).*/g);
        if (lines) {
            this.yylineno++;
            this.yylloc.last_line++;
        } else {
            this.yylloc.last_column++;
        }
        if (this.options.ranges) {
            this.yylloc.range[1]++;
        }

        this._input = this._input.slice(1);
        return ch;
    },

// unshifts one char (or a string) into the input
unput:function (ch) {
        var len = ch.length;
        var lines = ch.split(/(?:\r\n?|\n)/g);

        this._input = ch + this._input;
        this.yytext = this.yytext.substr(0, this.yytext.length - len);
        //this.yyleng -= len;
        this.offset -= len;
        var oldLines = this.match.split(/(?:\r\n?|\n)/g);
        this.match = this.match.substr(0, this.match.length - 1);
        this.matched = this.matched.substr(0, this.matched.length - 1);

        if (lines.length - 1) {
            this.yylineno -= lines.length - 1;
        }
        var r = this.yylloc.range;

        this.yylloc = {
            first_line: this.yylloc.first_line,
            last_line: this.yylineno + 1,
            first_column: this.yylloc.first_column,
            last_column: lines ?
                (lines.length === oldLines.length ? this.yylloc.first_column : 0)
                 + oldLines[oldLines.length - lines.length].length - lines[0].length :
              this.yylloc.first_column - len
        };

        if (this.options.ranges) {
            this.yylloc.range = [r[0], r[0] + this.yyleng - len];
        }
        this.yyleng = this.yytext.length;
        return this;
    },

// When called from action, caches matched text and appends it on next action
more:function () {
        this._more = true;
        return this;
    },

// When called from action, signals the lexer that this rule fails to match the input, so the next matching rule (regex) should be tested instead.
reject:function () {
        if (this.options.backtrack_lexer) {
            this._backtrack = true;
        } else {
            return this.parseError('Lexical error on line ' + (this.yylineno + 1) + '. You can only invoke reject() in the lexer when the lexer is of the backtracking persuasion (options.backtrack_lexer = true).\n' + this.showPosition(), {
                text: "",
                token: null,
                line: this.yylineno
            });

        }
        return this;
    },

// retain first n characters of the match
less:function (n) {
        this.unput(this.match.slice(n));
    },

// displays already matched input, i.e. for error messages
pastInput:function () {
        var past = this.matched.substr(0, this.matched.length - this.match.length);
        return (past.length > 20 ? '...':'') + past.substr(-20).replace(/\n/g, "");
    },

// displays upcoming input, i.e. for error messages
upcomingInput:function () {
        var next = this.match;
        if (next.length < 20) {
            next += this._input.substr(0, 20-next.length);
        }
        return (next.substr(0,20) + (next.length > 20 ? '...' : '')).replace(/\n/g, "");
    },

// displays the character position where the lexing error occurred, i.e. for error messages
showPosition:function () {
        var pre = this.pastInput();
        var c = new Array(pre.length + 1).join("-");
        return pre + this.upcomingInput() + "\n" + c + "^";
    },

// test the lexed token: return FALSE when not a match, otherwise return token
test_match:function (match, indexed_rule) {
        var token,
            lines,
            backup;

        if (this.options.backtrack_lexer) {
            // save context
            backup = {
                yylineno: this.yylineno,
                yylloc: {
                    first_line: this.yylloc.first_line,
                    last_line: this.last_line,
                    first_column: this.yylloc.first_column,
                    last_column: this.yylloc.last_column
                },
                yytext: this.yytext,
                match: this.match,
                matches: this.matches,
                matched: this.matched,
                yyleng: this.yyleng,
                offset: this.offset,
                _more: this._more,
                _input: this._input,
                yy: this.yy,
                conditionStack: this.conditionStack.slice(0),
                done: this.done
            };
            if (this.options.ranges) {
                backup.yylloc.range = this.yylloc.range.slice(0);
            }
        }

        lines = match[0].match(/(?:\r\n?|\n).*/g);
        if (lines) {
            this.yylineno += lines.length;
        }
        this.yylloc = {
            first_line: this.yylloc.last_line,
            last_line: this.yylineno + 1,
            first_column: this.yylloc.last_column,
            last_column: lines ?
                         lines[lines.length - 1].length - lines[lines.length - 1].match(/\r?\n?/)[0].length :
                         this.yylloc.last_column + match[0].length
        };
        this.yytext += match[0];
        this.match += match[0];
        this.matches = match;
        this.yyleng = this.yytext.length;
        if (this.options.ranges) {
            this.yylloc.range = [this.offset, this.offset += this.yyleng];
        }
        this._more = false;
        this._backtrack = false;
        this._input = this._input.slice(match[0].length);
        this.matched += match[0];
        token = this.performAction.call(this, this.yy, this, indexed_rule, this.conditionStack[this.conditionStack.length - 1]);
        if (this.done && this._input) {
            this.done = false;
        }
        if (token) {
            return token;
        } else if (this._backtrack) {
            // recover context
            for (var k in backup) {
                this[k] = backup[k];
            }
            return false; // rule action called reject() implying the next rule should be tested instead.
        }
        return false;
    },

// return next match in input
next:function () {
        if (this.done) {
            return this.EOF;
        }
        if (!this._input) {
            this.done = true;
        }

        var token,
            match,
            tempMatch,
            index;
        if (!this._more) {
            this.yytext = '';
            this.match = '';
        }
        var rules = this._currentRules();
        for (var i = 0; i < rules.length; i++) {
            tempMatch = this._input.match(this.rules[rules[i]]);
            if (tempMatch && (!match || tempMatch[0].length > match[0].length)) {
                match = tempMatch;
                index = i;
                if (this.options.backtrack_lexer) {
                    token = this.test_match(tempMatch, rules[i]);
                    if (token !== false) {
                        return token;
                    } else if (this._backtrack) {
                        match = false;
                        continue; // rule action called reject() implying a rule MISmatch.
                    } else {
                        // else: this is a lexer rule which consumes input without producing a token (e.g. whitespace)
                        return false;
                    }
                } else if (!this.options.flex) {
                    break;
                }
            }
        }
        if (match) {
            token = this.test_match(match, rules[index]);
            if (token !== false) {
                return token;
            }
            // else: this is a lexer rule which consumes input without producing a token (e.g. whitespace)
            return false;
        }
        if (this._input === "") {
            return this.EOF;
        } else {
            return this.parseError('Lexical error on line ' + (this.yylineno + 1) + '. Unrecognized text.\n' + this.showPosition(), {
                text: "",
                token: null,
                line: this.yylineno
            });
        }
    },

// return next match that has a token
lex:function lex() {
        var r = this.next();
        if (r) {
            return r;
        } else {
            return this.lex();
        }
    },

// activates a new lexer condition state (pushes the new lexer condition state onto the condition stack)
begin:function begin(condition) {
        this.conditionStack.push(condition);
    },

// pop the previously active lexer condition state off the condition stack
popState:function popState() {
        var n = this.conditionStack.length - 1;
        if (n > 0) {
            return this.conditionStack.pop();
        } else {
            return this.conditionStack[0];
        }
    },

// produce the lexer rule set which is active for the currently active lexer condition state
_currentRules:function _currentRules() {
        if (this.conditionStack.length && this.conditionStack[this.conditionStack.length - 1]) {
            return this.conditions[this.conditionStack[this.conditionStack.length - 1]].rules;
        } else {
            return this.conditions["INITIAL"].rules;
        }
    },

// return the currently active lexer condition state; when an index argument is provided it produces the N-th previous condition state, if available
topState:function topState(n) {
        n = this.conditionStack.length - 1 - Math.abs(n || 0);
        if (n >= 0) {
            return this.conditionStack[n];
        } else {
            return "INITIAL";
        }
    },

// alias for begin(condition)
pushState:function pushState(condition) {
        this.begin(condition);
    },

// return the number of states currently on the stack
stateStackSize:function stateStackSize() {
        return this.conditionStack.length;
    },
options: {},
performAction: function anonymous(yy,yy_,$avoiding_name_collisions,YY_START) {  /*
Copyright (c) 2010-2011, Dimagi Inc., and individual contributors.
All rights reserved.

Redistribution and use in source and binary forms, with or without
modification, are permitted provided that the following conditions are met:
    * Redistributions of source code must retain the above copyright
      notice, this list of conditions and the following disclaimer.
    * Redistributions in binary form must reproduce the above copyright
      notice, this list of conditions and the following disclaimer in the
      documentation and/or other materials provided with the distribution.
    * Neither the name of the Dimagi, nor the names of its contributors may 
      be used to endorse or promote products derived from this software 
      without specific prior written permission.

THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS "AS IS" AND
ANY EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE IMPLIED
WARRANTIES OF MERCHANTABILITY AND FITNESS FOR A PARTICULAR PURPOSE ARE
DISCLAIMED. IN NO EVENT SHALL DIMAGI INC. BE LIABLE FOR ANY
DIRECT, INDIRECT, INCIDENTAL, SPECIAL, EXEMPLARY, OR CONSEQUENTIAL DAMAGES
(INCLUDING, BUT NOT LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS OR SERVICES;
LOSS OF USE, DATA, OR PROFITS; OR BUSINESS INTERRUPTION) HOWEVER CAUSED AND
ON ANY THEORY OF LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY, OR TORT
(INCLUDING NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE OF THIS
SOFTWARE, EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.
*/

var YYSTATE=YY_START;
switch($avoiding_name_collisions) {
case 0:/* ignore whitespace */ 
break;
case 1: yy.xpathModels.debugLog("NODETYPE", yy_.yytext); return "NODETYPE_NODE"; 
break;
case 2: yy.xpathModels.debugLog("NODETYPE", yy_.yytext); return "NODETYPE_TEXT"; 
break;
case 3: yy.xpathModels.debugLog("NODETYPE", yy_.yytext); return "NODETYPE_COMMENT"; 
break;
case 4: yy.xpathModels.debugLog("NODETYPE", yy_.yytext); return "NODETYPE_PROCINSTR"; 
break;
case 5: this.begin("OP_CONTEXT"); yy_.yytext = yy_.yytext.substr(1,yy_.yyleng-1); yy.xpathModels.debugLog("VAR", yy_.yytext); return "VAR"; 
break;
case 6: this.begin("OP_CONTEXT"); 
                                     yy_.yytext = yy_.yytext.substr(0, yy_.yyleng-2);
                                     yy.xpathModels.debugLog("NSWILDCARD", yy_.yytext); return "NSWILDCARD"; 
break;
case 7: this.begin("OP_CONTEXT"); yy.xpathModels.debugLog("QNAME", yy_.yytext); return "QNAME"; 
break;
case 8: this.begin("OP_CONTEXT"); yy.xpathModels.debugLog("WILDCARD", yy_.yytext); return "WILDCARD"; 
break;
case 9: this.begin("VAL_CONTEXT"); yy.xpathModels.debugLog("MULT", yy_.yytext); return "MULT"; 
break;
case 10: this.begin("VAL_CONTEXT"); yy.xpathModels.debugLog("AND", yy_.yytext); return "AND"; 
break;
case 11: this.begin("VAL_CONTEXT"); yy.xpathModels.debugLog("OR", yy_.yytext); return "OR"; 
break;
case 12: this.begin("VAL_CONTEXT"); yy.xpathModels.debugLog("DIV", yy_.yytext); return "DIV"; 
break;
case 13: this.begin("VAL_CONTEXT"); yy.xpathModels.debugLog("MOD", yy_.yytext); return "MOD"; 
break;
case 14: this.begin("OP_CONTEXT"); yy.xpathModels.debugLog("NUM", yy_.yytext); return "NUM"; 
break;
case 15: this.begin("VAL_CONTEXT"); yy.xpathModels.debugLog("EQ", yy_.yytext); return "EQ"; 
break;
case 16: this.begin("VAL_CONTEXT"); yy.xpathModels.debugLog("NEQ", yy_.yytext); return "NEQ"; 
break;
case 17: this.begin("VAL_CONTEXT"); yy.xpathModels.debugLog("LTE", yy_.yytext); return "LTE"; 
break;
case 18: this.begin("VAL_CONTEXT"); yy.xpathModels.debugLog("LT", yy_.yytext); return "LT"; 
break;
case 19: this.begin("VAL_CONTEXT"); yy.xpathModels.debugLog("GTE", yy_.yytext); return "GTE"; 
break;
case 20: this.begin("VAL_CONTEXT"); yy.xpathModels.debugLog("GT", yy_.yytext); return "GT"; 
break;
case 21: this.begin("VAL_CONTEXT"); yy.xpathModels.debugLog("PLUS", yy_.yytext); return "PLUS"; 
break;
case 22: this.begin("VAL_CONTEXT"); yy.xpathModels.debugLog("MINUS", yy_.yytext); return "MINUS"; 
break;
case 23: this.begin("VAL_CONTEXT"); yy.xpathModels.debugLog("UNION", yy_.yytext); return "UNION"; 
break;
case 24: this.begin("VAL_CONTEXT"); yy.xpathModels.debugLog("DBL", yy_.yytext); return "DBL_SLASH"; 
break;
case 25: this.begin("VAL_CONTEXT"); yy.xpathModels.debugLog("SLASH", yy_.yytext); return "SLASH"; 
break;
case 26: this.begin("VAL_CONTEXT"); yy.xpathModels.debugLog("LBRACK", yy_.yytext); return "LBRACK"; 
break;
case 27: this.begin("OP_CONTEXT");  yy.xpathModels.debugLog("RBRACK", yy_.yytext); return "RBRACK"; 
break;
case 28: this.begin("VAL_CONTEXT"); yy.xpathModels.debugLog("LPAREN", yy_.yytext); return "LPAREN"; 
break;
case 29: this.begin("OP_CONTEXT");  yy.xpathModels.debugLog("RPAREN", yy_.yytext); return "RPAREN"; 
break;
case 30: this.begin("OP_CONTEXT");  yy.xpathModels.debugLog("DBL", yy_.yytext); return "DBL_DOT"; 
break;
case 31: this.begin("OP_CONTEXT");  yy.xpathModels.debugLog("DOT", yy_.yytext); return "DOT"; 
break;
case 32: this.begin("VAL_CONTEXT"); yy.xpathModels.debugLog("AT", yy_.yytext); return "AT"; 
break;
case 33: this.begin("VAL_CONTEXT"); yy.xpathModels.debugLog("DBL", yy_.yytext); return "DBL_COLON"; 
break;
case 34: this.begin("VAL_CONTEXT"); yy.xpathModels.debugLog("COMMA", yy_.yytext); return "COMMA"; 
break;
case 35: this.begin("VAL_CONTEXT"); yy.xpathModels.debugLog("HASH", yy_.yytext); return "HASH"; 
break;
case 36: this.begin("OP_CONTEXT"); yy.xpathModels.debugLog("STR", yy_.yytext); return "STR"; 
break;
case 37:return 5;
break;
}
},
rules: [/^(?:((\s+)))/,/^(?:node(?=(((\s+))?\()))/,/^(?:text(?=(((\s+))?\()))/,/^(?:comment(?=(((\s+))?\()))/,/^(?:processing-instruction(?=(((\s+))?\()))/,/^(?:\$([A-Za-z_][A-Za-z0-9._-]*(:[A-Za-z_][A-Za-z0-9._-]*)?))/,/^(?:([A-Za-z_][A-Za-z0-9._-]*):\*)/,/^(?:([A-Za-z_][A-Za-z0-9._-]*(:[A-Za-z_][A-Za-z0-9._-]*)?))/,/^(?:\*)/,/^(?:\*)/,/^(?:(and))/,/^(?:(or))/,/^(?:(div))/,/^(?:(mod))/,/^(?:(([0-9])+(\.([0-9])*)?|(\.([0-9])+)))/,/^(?:=)/,/^(?:!=)/,/^(?:<=)/,/^(?:<)/,/^(?:>=)/,/^(?:>)/,/^(?:\+)/,/^(?:-)/,/^(?:\|)/,/^(?:\/\/)/,/^(?:\/)/,/^(?:\[)/,/^(?:\])/,/^(?:\()/,/^(?:\))/,/^(?:\.\.)/,/^(?:\.)/,/^(?:@)/,/^(?:::)/,/^(?:,)/,/^(?:#)/,/^(?:("[^"\""]*"|'[^'\'']*'))/,/^(?:$)/],
conditions: {"INITIAL":{"rules":[0,1,2,3,4,5,6,7,8,14,15,16,17,18,19,20,21,22,23,24,25,26,27,28,29,30,31,32,33,34,35,36,37],"inclusive":true},"OP_CONTEXT":{"rules":[0,1,2,3,4,5,9,10,11,12,13,14,15,16,17,18,19,20,21,22,23,24,25,26,27,28,29,30,31,32,33,34,35,36,37],"inclusive":true},"VAL_CONTEXT":{"rules":[0,1,2,3,4,5,6,7,8,14,15,16,17,18,19,20,21,22,23,24,25,26,27,28,29,30,31,32,33,34,35,36,37],"inclusive":true}}
});
return lexer;
})();
parser.lexer = lexer;
return parser;
});