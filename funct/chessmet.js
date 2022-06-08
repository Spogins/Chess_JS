window.onload = function(event) {

var board = {
    letters: {A: 7, B: 6, C: 5, D: 4, E: 3, F: 2, G: 1, H: 0}, 
    selList: [],
    moove: null,
    new_desk: [],
    frst: {
        //аббревиатуры: v - vertical, g - gorizontal, l - left, r - right, t - top, b - bottom
        ladia: [[0, 7, 24, 31], [{vr: 'vt', dn: 1, step: 7}, {vr: 'vb', dn: -1, step: 7}, {vr: 'gl', dn: 1, step: 7}, {vr: 'gr', dn: -1, step: 7}]],
        kon: [[1, 6, 25, 30], [{vr: 'glt', dn: 1, step: 1}, {vr: 'glb', dn: 1, step: 1}, {vr: 'grt', dn: -1, step: 1}, {vr: 'grb', dn: -1, step: 1}, {vr: 'vtl', dn: 1, step: 1}, {vr: 'vbl', dn: 1, step: 1}, {vr: 'vtr', dn: -1, step: 1}, {vr: 'vbr', dn: -1, step: 1}]],
        slon: [[2, 5, 26, 29],[{vr: 'dlt', dn: 1, step: 7}, {vr: 'dlb', dn: -1, step: 7}, {vr: 'drt', dn: -1, step: 7}, {vr: 'drb', dn: 1, step: 7}]],
        ferz: [[3, 27], [{vr: 'vt', dn: 1, step: 7}, {vr: 'vb', dn: -1, step: 7}, {vr: 'gl', dn: 1, step: 7}, {vr: 'gr', dn: -1, step: 7}, {vr: 'dlt', dn: 1, step: 7}, {vr: 'dlb', dn: -1, step: 7}, {vr: 'drt', dn: -1, step: 7}, {vr: 'drb', dn: 1, step: 7}]],
        korol: [[4, 28], [{vr: 'vt', dn: 1, step: 1}, {vr: 'vb', dn: -1, step: 1}, {vr: 'gl', dn: 1, step: 1}, {vr: 'gr', dn: -1, step: 1}, {vr: 'dlt', dn: 1, step: 1}, {vr: 'dlb', dn: -1, step: 1}, {vr: 'drt', dn: -1, step: 1}, {vr: 'drb', dn: 1, step: 1}]],
        peshka: [[], [{vr: 'vt', dn: 1, step: 1}, {vr: 'dlt', dn: 1, step: 1}, {vr: 'drt', dn: -1, step: 1}]]
    },
    figCol: {white: '_w',black: '_b'},
    figList: [],
    possibleMooveFieldList: [],
    dictionary: {white: 'белых', black: 'черных'},
    sideStep: 'white',
    checkMateId: '',
    kingPosition: {white: 4, black: 60},
    selListClear: function(){
        for (var q=0; q<this.selList.length; q++)
            document.getElementById(this.selList[q]).style.backgroundColor = ''
        this.selList = []
    },
    selField: function(id, color){
        var ind = this.selList.indexOf(id)
        if(ind === -1){ 
            this.selList.push(id)
            document.getElementById(id).style.backgroundColor = color
        }
    },
    figMoove: function(from, too){
        var fromPoleInd = this.poleMod(from).polIndx
        var tooPoleInd = this.poleMod(too).polIndx
        this.new_desk[this.poleMod(from).polIndx]['stepCount'] += 1
        this.new_desk[tooPoleInd] = this.new_desk[fromPoleInd]
        this.new_desk[fromPoleInd] = ''
        document.getElementById(too).innerHTML = document.getElementById(from).innerHTML
        document.getElementById(from).innerHTML = ''
        var figExam = this.new_desk[this.poleMod(too).polIndx]
        if(figExam.type == 'korol') this.kingPosition[figExam.color] = tooPoleInd
    },
    poleMod: function(){
        //conversion
        var convertation = {polId: NaN, polIndx: NaN}
        if(isNaN(parseInt(arguments[0]))){
            var l = arguments[0][0]
            var n = arguments[0][1]
            if(arguments[0].length < 3){
                var ind = (n * 8 - this.letters[l]) - 1
                if(ind > -1 && ind < 64){
                    convertation.polIndx = ind
                    convertation.polId = arguments[0]
                }
            }
        }else{
            var letlist = Object.keys(board.letters)
            if(arguments[0] >= 0 && arguments[0] <= 63){
                if(arguments[0] <= 5){
                    convertation.polId = (letlist[arguments[0] % 8]) + 1
                }else convertation.polId = (letlist[arguments[0] % 8]) + (Math.floor(arguments[0] / 8) + 1)

                convertation.polIndx = arguments[0]
            }
        }

        if(arguments.length > 1){
            //creation of direction
            var direct = {gl: -1, gr: 1, vt: 8, vb: -8, dlt: 7, dlb: -7, drt: 9, drb: -9, glt: 6, glb: -10, grt: 10, grb: -6, vtl: 15, vbl: -17, vtr: 17, vbr: -15}

            convertation.polIndx += direct[arguments[1]]
            if(convertation.polIndx <= 63 && convertation.polIndx >= 0){
                return this.poleMod(convertation.polIndx)
            }else return null
             
        }
        return convertation
    },
    possibleMoove: function(mv){
        var figProp = figureGetProp(mv.figId)
        var rules = this.frst[figProp.type][1]
        //korol definder
        if(this.defKorol(mv) != false){ 
            if(this.defKorol(mv) == true){
                return
            }
            else rules = this.defKorol(mv)
        } 
        
        //CH
        this.checkMate(board.moove)  


        //chek stepCount peshka
        if(figProp.type == 'peshka'){
            if(figProp.stepCount == 0){ 
                rules[0].step = 2
            }
            else rules[0].step = 1
        }

        for(var i = 0; i < rules.length; i++){
            var direction = this.checkDirection(mv.polId, rules[i])
            //check pechka color
            if(figProp.type == 'peshka' && figProp.color == 'black') direction = this.checkDirection(mv.polId, this.revRule(rules[i]))

            for(var z = 0; z < direction.length; z++){   

                //korol checking possible moves
                if (figProp.type == 'korol'){
                    if(this.checkAtack(direction[z].polId, mv.figId).length != 0) break
                }

                //painting fields
                if(direction[z].data == '' ){
                    if(figProp.type == 'peshka' && i != 0)break
                    this.selField(direction[z].polId, '#0074D9')
                }
                else if(figProp.color != direction[z].data.color ){
                    if(figProp.type == 'peshka' && i == 0)break
                    this.selField(direction[z].polId, '#ff0000');
                }
                else break          
            }
        }
        //castling check
        if(figProp.type == 'korol' && figProp.stepCount == 0){
            this.korolRok(mv)
        }   
    },
    checkDirection: function(beginDeskIndx, rule){
        beginDeskIndx = this.poleMod(beginDeskIndx).polIndx
        var res = []
        var str = ''
        var countStep = rule.step
        do{
            if(this.poleMod(beginDeskIndx, rule.vr) != null){
                str = (beginDeskIndx % 8)
                beginDeskIndx = this.poleMod(beginDeskIndx, rule.vr).polIndx
                if(rule.dn == 1 && (beginDeskIndx % 8) > str || rule.dn == -1 && (beginDeskIndx % 8) < str){
                    return res
                }
            } 
            else return res
            
            if(this.new_desk[beginDeskIndx] != ''){
                res.push({polId: this.poleMod(beginDeskIndx).polId, data: this.new_desk[beginDeskIndx]})
                return res
            } 
            else {
                res.push({polId: this.poleMod(beginDeskIndx).polId, data: ''})
                countStep--
            } 
        }while(countStep > 0);    
        return res
    },
    checkAtack: function(poleInd, figId){
        //array index rules rules: конь - rules[0-7], ферзь - rules[8-15], ладья - rules[8-11], слон - rules[12-15]
        var rules = this.frst.kon[1].concat(this.frst.ferz[1])
        var figList = []
        var direction = ''
        var type = ''
        var figData = figureGetProp(figId)
        //getting a list of figures that can attack the specified field
        for(var q = 0; q < rules.length; q++){
            direction = this.checkDirection(this.poleMod(poleInd).polIndx, rules[q])
            if(direction.length > 0 && direction[direction.length - 1].data != ''){
                type = direction[direction.length - 1].data.type
                //separation of figures and rules
                switch(type){ 
                    case 'kon':
                        if(q < 8 && figData.color != direction[direction.length - 1].data.color) 
                        figList.push({rule: rules[q], fig: type, pole: direction[direction.length - 1].polId}) 
                    break;
                    case 'slon':
                        if(q > 11 && figData.color != direction[direction.length - 1].data.color) 
                        figList.push({rule: rules[q], fig: type, pole: direction[direction.length - 1].polId}) 
                    break;
                    case 'ladia':
                        if(q > 7 && q < 12 && figData.color != direction[direction.length - 1].data.color) 
                        figList.push({rule: rules[q], fig: type, pole: direction[direction.length - 1].polId})
                    break;
                    case 'ferz':
                        if(q > 7 && figData.color != direction[direction.length - 1].data.color) 
                        figList.push({rule: rules[q], fig: type, pole: direction[direction.length - 1].polId})
                    break;
                    case 'peshka':
                        if(figData.color == 'black' && direction.length == 1 && figData.color != direction[direction.length - 1].data.color){
                            if(q == 13 || q == 15) 
                            figList.push({vector: rules[q].vr, fig: type, pole: direction[direction.length - 1].polId})
                        }
                        else if(figData.color == 'white'&& direction.length == 1 && figData.color != direction[direction.length - 1].data.color){
                            if(q == 12 || q == 14) 
                            figList.push({vector: rules[q].vr, fig: type, pole: direction[direction.length - 1].polId})
                        }
                    break;
                    case 'korol':
                        if(figData.type == 'korol' && q > 7 && direction.length == 1 && figData.color != direction[direction.length - 1].data.color){
                            figList.push({vector: rules[q].vr, fig: type, pole: direction[direction.length - 1].polId})
                        }
                        else if(q > 7 && figData.type != 'korol') 
                            figList.push({rule: rules[q], fig: type, pole: direction[direction.length - 1].polId, color: direction[direction.length - 1].data.color})
                    break;
                }
            }  
        }
        return figList
    },
    korolRok: function(data){
        var rule = [{vr: 'gl', dn: 1, step: 7}, {vr: 'gr', dn: -1, step: 7}]
        var rock = false
        if(this.checkAtack(data.polId, data.figId).length == 0){
            for(var i = 0; i < rule.length; i++){
                var direction = this.checkDirection(data.polId, rule[i])
                if(direction.length > 0 && direction[direction.length -1].data.type == 'ladia' && direction[direction.length -1].data.stepCount == 0){
                    rock = true
                    for(var q = 0; q < direction.length; q++){
                        if(this.checkAtack(direction[q].polId, data.figId).length != 0) rock = false
                    }
                    if(rock == true) this.selField(direction[1].polId, '#ff00ff')
                }
            }
        }
        else return
    },
    checkKorol: function(polId){
        
        var figData = this.new_desk[this.poleMod(polId).polIndx]
        
        if(figData.type != 'korol'){
            var rules = this.frst[figData.type][1]
            var direction = ''
            for(var i = 0; i < rules.length; i++){
                direction = this.checkDirection(polId, rules[i])
                if(direction.length > 0 && direction[direction.length -1].data.type == 'korol' && figData.color != direction[direction.length -1].data.color){
                    
                    //выполнить проверку на мат
                    if(this.checkMate(polId)){
                        var check = this.checkAtack(polId, figData.id)
                        for(var q = 0; q < check.length; q++){
                            if(check.length > 0 && check[q].fig != 'korol')return window.setTimeout(function(){confirm('Упс, вам Шах!')})
                        }
                        
                        return window.setTimeout(function(){confirm('Вам Мат!')})
                    }
                    else return window.setTimeout(function(){confirm('Упс, вам Шах!')})
                }
            }
        }
        
    },
    defKorol: function(data){
        var figData = figureGetProp(data.figId)
        var check = this.checkAtack(data.polId, data.figId)
        var revRule = ''
        var rules = []

        if(check != 0){
            //checking the setup and possible moves
            for(var i = 0; i < check.length; i++){
                if(check[i].fig == 'korol' && check[i].color == figData.color && revRule == ''){
                    revRule = this.revRule(check[i].rule)
                    rules = [check[i].rule, revRule]
                    i = 0
                }
                if(check[i].fig != 'peshka'){
                    if(revRule != '' && check[i].rule.vr == revRule.vr){
                        //check if it is possible to checkmate
                        for(var x = 0; x < this.frst[figData.type][1].length; x++){
                            var dir = this.checkDirection(data.polId, this.frst[figData.type][1][x])
                            console.log(dir)
                            if(dir.length != 0 && dir[dir.length -1].data.type == 'korol' && figData.color != dir[dir.length -1].data.color){
                                this.selField(dir[dir.length -1].polId, '#ff0000')
                            }
                        }

                        for(var q = 0; q < this.frst[figData.type][1].length; q++){
                            if(this.frst[figData.type][1][q].vr == rules[0].vr){
                                return rules  
                            }
                        }
                        return true
                    }
                }
            }
            return false
        }
        return false 
    },
    revRule: function(rule){
        //getting the reverse rule
        var vr = {gl: 'gr', gr: 'gl', vt: 'vb', vb: 'vt', dlt: 'dlb', dlb: 'dlt', drt: 'drb', drb: 'drt'}
        var revRule = {vr: vr[rule.vr], dn: (rule.dn * -1), step: rule.step}
        return revRule 
    },
    checkMate: function(checkPolId){
        var figData = figureGetProp(checkPolId.figId)
        var korolRules = this.frst.korol[1]
        var korolDir = ''
        var korolPosMoove = []
        var korolPolId = this.kingPosition[this.getReverseSideClr()]
        //checkin possible moove for korol
        for(var i = 0; i < korolRules.length; i++){
            korolDir = this.checkDirection(korolPolId, korolRules[i])
            if(korolDir.length > 0){
                if(korolDir[0].data == ''){
                    if(this.checkAtack(korolDir[0].polId, this.new_desk[korolPolId].id).length == 0){  
                        korolPosMoove.push(korolDir[0])
                    }
                }
                else if(korolDir[0].data.color == figData.color)korolPosMoove.push(korolDir[0])
            }
        }

        if(korolPosMoove.length == 0){
            return true
        }
        else return false
    },
    sideMoove: function(color){
        this.sideStep = color
        window.setTimeout(
            function(){
                confirm('Ход' + ' ' + board.dictionary[board.getCurrentSideClr()], 1000)
            })
    },
    getCurrentSideClr: function(){
        return this.sideStep
    },
    getReverseSideClr: function(){
        var conver = {white: 'black', black: 'white'}
        return conver[this.sideStep]
    }
}

function figureGetProp(figId){
    //getting figure data
    for(var i = 0; i < board.new_desk.length; i++){
        if(board.new_desk[i].id == figId){          
            return board.new_desk[i]
        }     
    }
    return {color: 'error'}
}

function boardclick(e){
    var res = {figId: '', polId: '', transPolId: ''}
    
    if(e.path.length >= 10){
        res.figId = e.path[1].id
        res.polId = e.path[2].id
    } else {
        if(document.getElementById('transPanel').style.display == 'flex' && e.path[0].id.length > 2){
            res.figId = e.path[0].id
            res.polId = 'transPanel'
            var prop = {type: res.figId, color: figureGetProp(board.moove.figId).color, pic: "src='figure/"+ res.figId + board.figCol[figureGetProp(board.moove.figId).color] + ".png'", id: res.figId + '_n', stepCount: 0}
            board.new_desk[board.poleMod(board.moove.transPolId).polIndx] = prop
            document.getElementById(board.moove.transPolId).innerHTML = "<div id = "+ prop.id + "><img "+ prop.pic +"></div>"
            document.getElementById('transPanel').style.display = 'none'
            document.getElementById('transPanel').innerHTML = "" 
            board.moove = null
            res = {figId: '', polId: '', transPolId: ''}
            board.sideMoove(board.getReverseSideClr())  
        }else{
            res.polId = e.path[0].id
        }  
    } 

    if(document.getElementById('transPanel').style.display == 'flex'){
        return
    }
   
    if(board.moove == null){
        console.log('c1')
        if(res.figId.length > 0){

            if(board.sideStep != figureGetProp(res.figId).color) return
            board.moove = res
            board.selField(res.polId, '#ffff00') 
            board.possibleMoove(board.moove)
        }    
    } 
    else {
        console.log('c2')
        if(board.moove.polId == res.polId){
            board.selField(res.polId)
            board.moove = null
            board.selListClear()
            console.log('clearing c2')           
        }
        else {
            //moove the selected figure
            if(figureGetProp(board.moove.figId).color !== figureGetProp(res.figId).color && document.getElementById(res.polId).style.backgroundColor !== ''){
                
                //peshka transformation
                if(figureGetProp(board.moove.figId).type == 'peshka'){
                    if(parseInt(res.polId[1]) == 8 || parseInt(res.polId[1]) == 1){
                        document.getElementById('transPanel').style.check = e.clientX + 'px'
                        document.getElementById('transPanel').style.top = e.clientY + 'px'
                        var figTypeList = Object.keys(board.frst)
                        for(var i = 0; i < 4; i++){
                            document.getElementById('transPanel').innerHTML += "<div><img id ='"+ figTypeList[i] +"' src='figure/"+ figTypeList[i] + board.figCol[figureGetProp(board.moove.figId).color] + ".png'></div>"
                            document.getElementById('transPanel').style.display = 'flex'
                        }
                        board.figMoove(board.moove.polId, res.polId)
                        board.selListClear()
                        board.moove.transPolId = res.polId                 
                        return
                    }                   
                }
                
                //korol rok
                if(figureGetProp(board.moove.figId).type == 'korol' && figureGetProp(board.moove.figId).stepCount == 0){
                    var letlist = Object.keys(board.letters)
                    if(res.polId[0] == letlist[2]){
                        board.figMoove(('A' + res.polId[1]), (letlist[3] + res.polId[1]))
                    }
                    if(res.polId[0] == letlist[6]){
                        board.figMoove(('H' + res.polId[1]), (letlist[5] + res.polId[1]))
                    }        
                }
                
                board.figMoove(board.moove.polId, res.polId)
                board.selListClear()
                board.checkKorol(res.polId)
                board.sideMoove(board.getReverseSideClr())  
                board.moove = null          
            }
        }
    }    
}

function displayDesk(){

    var letlist = Object.keys(board.letters)
    var desk = ""
    var showABC = "<div class='chip_abc'>"
    var polNum = 0
    var polLet = 0
    var deskInd = 0
    for(i = 0; i < letlist.length ; i++){
        desk += "<div id = 'str_"+(i+1)+"' class='chip'><div class='numbr'>"+ [8 - i] +"</div>" 
        
        for (j = 0; j < letlist.length; j++){
            desk += "<div id=" + letlist[j] + [8 - i] 

            board.new_desk[deskInd] = ''
            deskInd += 1 
                      
            if((j + i) % 2 == 0){
                desk += " class='white'></div>"
            }   
              else 
                desk += " class='black'></div>";
            
            if(polNum < 8){
                polNum++                
            } else {
                polLet++
                polNum = 1
            }
            
        }
        desk += "</div>"
        showABC += "<div class='abcbot'>"+ letlist[i] +"</div>"
    }

    showABC += "</div>"
    desk += showABC
    
    document.getElementById("mainDesk").innerHTML = desk
    document.getElementById("mainDesk").addEventListener("click", boardclick)
    document.getElementById("transPanel").addEventListener("click", boardclick) 
}

function figureType(indx){
    var type = Object.keys(board.frst)
    for(i = 0; i < type.length; i++){
        var elem = board.frst[type[i]][0]

        if(elem.indexOf(indx) !== -1){
            return type[i]
        }
    }
}

function newGame(){
    var letlist = Object.keys(board.letters)
    var inx = 0
    var row = [1, 2, 7, 8]
    var row_inx = 0
    var col = 'white'
    var polId
    for(var i = 0; i < 32; i++){
        var obj = {type: '', color: '', pic: '', id: ''}

        if(i < 16) {
            obj.color = 'white'          
        }
        else {
            obj.color = 'black'
            col = 'black'            
        }
        
        if(i > 7 && i < 24)
        {
            obj.type = Object.keys(board.frst)[5]
            obj.pic = "src='figure/peshka"+ board.figCol[col] +".png'"
        } else {
            obj.type = figureType(i)
            obj.pic = "src='figure/" + figureType(i) + board.figCol[col] +".png'"
        }
        
        obj.id = obj.type + i
        obj.stepCount = 0
        board.figList.push(obj)
        document.getElementById(letlist[inx] + row[row_inx]).innerHTML = "<div id = "+ obj.id + "><img " + board.figList[i].pic + "></div>"        
        polId = board.poleMod(letlist[inx] + row[row_inx]).polIndx
        if(((i+1) % 8 == 0) && (i != 0)){ 
            inx = 0
            row_inx++
        }else inx++
        board.new_desk[polId] = obj
    }
    
    console.log(board.figList)  
     

}

displayDesk()

newGame()
setTimeout(function(){board.sideMoove('white')}, 1000)
console.log(board)
}