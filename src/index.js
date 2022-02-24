// una app para arrancar y una ventana o manera de crear ventanas
// app => aplicacion en si   BrowserWindow => poder implementarla
const { app, BrowserWindow, Menu, ipcMain } = require('electron');

const url = require('url');
const path = require('path');

// crear ventana global para cuando se elimine quede limpio los recursos del pc
let mainWindow
let newProductWindow


// evento para cuando inicia la app
app.on('ready',()=>{
    // ventana dentro de objeto colocar propiedades como ancho y largo
    mainWindow = new BrowserWindow({
        webPreferences: {
            nodeIntegration: true,
            contextIsolation: false,
        }
    });
    // lo que tiene que mostrar
    mainWindow.loadURL(url.format({
        // donde esta el html
        pathname: path.join(__dirname,'views/index.html'),
        protocol: 'file',
        slashes: true
    }))

    //crear nuevo menu parte superior
    const mainMenu = Menu.buildFromTemplate(templateMeny);
    
    //integrar menuo
    Menu.setApplicationMenu(mainMenu);

    // cerrar aplicacion
    mainWindow.on('closed',()=>{
        app.quit();
    })
})

//recibir info de new product y enviar a la pantalla principal
ipcMain.on('product:new',(e, newProducto)=>{
    // lo que recibe lo envia a la ventana principal
    mainWindow.webContents.send('product:new',newProducto);
    // cerrar despues de enviar info al principal
    newProductWindow.close();
});

// nueva ventana para agregar porducto
function createNewProductWindow(){
    newProductWindow = new BrowserWindow({
        width:400,
        height:350,
        title:'Add A New Product',
        webPreferences: {
            nodeIntegration: true,
            contextIsolation: false
        }
    });
    //newProductWindow.setMenu(null);
    newProductWindow.loadURL(url.format({
        pathname: path.join(__dirname,'views/new-product.html'),
        protocol: 'file',
        slashes:true
    }))
    newProductWindow.on('closed',()=>{
        newProductWindow = null;
    })
}

// objeto con las pestanas (cada objeto es una)
const templateMeny = [
    {
        label: 'File',
        submenu: [
            {
                label: 'New Product',
                accelerator: 'Ctrl+N',
                click(){
                    createNewProductWindow();   
                }
            },
            {
                label: 'Remove All Products',
                click(){
                    mainWindow.webContents.send('products:remove-all')
                }
            },
            {
                label: 'Exit',
                accelerator: process.platform == 'darwin' ? 'command+Q' : 'Ctrl+Q',
                click(){
                    app.quit();
                }
            }
        ]
    }
]

// eliminar nombre de la app del menu de mac
if(process.platform == 'darwin'){
    templateMeny.unshift({
        label: app.getName()
    })
}

// herramientas de desarrollo
if(process.env.NODE_ENV !== 'production'){
    templateMeny.push({
        label: 'DevTools',
        submenu: [
            {
                label: 'Show/Hide Dev Tools',
                accelerator: 'Ctrl+D',
                click(item,focusedWindow){
                    focusedWindow.toggleDevTools();
                }
            },
            {
                role: 'reload'
            }
        ]
    })
}