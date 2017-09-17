Ext.define('PrintIt', 
{

extend: 'Rally.app.App',
alias: 'widget.printit',
componentCls: 'printit',
autoScroll: true,

launch: function() {

    this.add({
        xtype: 'image',
        itemId: 'logo',
        src: '/nitor-logo.png',
        width: '400px'
    });

    this.add({
        xtype: 'panel',
        html: 'Agile Central printing. Note that this app does not store any data. It just presents what you browse in Agile Central.'+ 
        ' An active session in Agile Central is needed, so log in there first. <br/>'
    });

    this.add({
        xtype: 'rallyprojectpicker',
        itemId: 'projects',
        value: this.getContext().getProject(),
        listeners:{
            change: this._onProjectSelected,
            scope: this
        }
    });
    
    this.add({
        xtype: 'rallyportfolioitemtypecombobox',
        itemId: 'types',
        listeners:{
            change: this._onTypeSelected,
            scope: this
        }                
    }),
    
    this.add({
        xtype: 'container',
        itemId: 'cards'
    });
    
    this.callParent(arguments);
},

_onTypeSelected: function() {
    oldTimeboxScope = this.getContext().getTimeboxScope();
    this.onScopeChange(oldTimeboxScope);
},

_onProjectSelected: function() {
    
    oldTimeboxScope = this.getContext().getTimeboxScope();
    var newContext = Ext.create(Rally.app.Context, {
	    initialValues: {
    	    project: this._getProjectFilter(),
            projectScopeDown: true
    	}
	});

	this.setContext(newContext);
	this.onScopeChange(oldTimeboxScope);
},

_getTypeFilter: function() {
    typeToLoad = 'portfolioitem/feature';
    if(this.down('#types').getRecord().data){
        typeToLoad = this.down('#types').getRecord().data.TypePath;
    }        
    return typeToLoad;
},

_getProjectFilter: function() {
	return this.down('#projects').getValue();
},

onScopeChange: function(scope) {
    this.down('#cards').getEl().setHTML('');
    this._load(scope);
},

_load: function(scope) {
    typeToLoad = this._getTypeFilter();
    Ext.create('Rally.data.wsapi.Store', {
        context: this.getContext().getDataContext(),
        autoLoad: true,
        model: Ext.identityFn(typeToLoad),
        fetch: ['FormattedID', 'Name', 'Description'],
        limit: (scope && scope.getRecord()) ? 200 : 50,
        listeners: {
            load: this._onLoaded,
            scope: this
        },
        filters: [
        ]
    });
    context = this.getContext().getDataContext();
},

_onLoaded: function(store, records) {
    var htmlSnip = '<div class="pb" style="page-break-after:always"></div>';
    _.each(records, function(record, idx) {
        htmlSnip += '<h1>' + record.data.Name + ' ('+ record.data.FormattedID + ')</h1>';
       	htmlSnip += ' ' + record.data.Description;
        htmlSnip += '<br/><br/><div class="pb" style="page-break-after:always"></div>';
    }, this);
    Ext.DomHelper.insertHtml('beforeEnd', this.down('#cards').getEl().dom, htmlSnip);

    if(Rally.BrowserTest) {
        Rally.BrowserTest.publishComponentReady(this);
    }
},

getOptions: function() {
    return [];
}

});   
Rally.launchApp('PrintIt', {
    name: 'Agile Central Prerttier Print'
});