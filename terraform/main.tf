resource "azurerm_resource_group" "aida_rg" {
  name     = "aida-rg"
  location = "Switzerland North"
}

resource "azurerm_virtual_network" "aida_vnet" {
  name                = "aida-vnet"
  address_space       = ["10.0.0.0/16"]
  location            = azurerm_resource_group.aida_rg.location
  resource_group_name = azurerm_resource_group.aida_rg.name
}

resource "azurerm_subnet" "aida_subnet" {
  name                 = "aida-subnet"
  resource_group_name  = azurerm_resource_group.aida_rg.name
  virtual_network_name = azurerm_virtual_network.aida_vnet.name
  address_prefixes     = ["10.0.1.0/24"]
}

resource "azurerm_public_ip" "aida_ip" {
  name                = "aida-public-ip"
  location            = azurerm_resource_group.aida_rg.location
  resource_group_name = azurerm_resource_group.aida_rg.name
  allocation_method   = "Static"
}

resource "azurerm_network_security_group" "aida_nsg" {
  name                = "aida-nsg"
  location            = azurerm_resource_group.aida_rg.location
  resource_group_name = azurerm_resource_group.aida_rg.name

  security_rule {
    name                       = "Allow-SSH"
    priority                   = 100
    direction                  = "Inbound"
    access                     = "Allow"
    protocol                   = "Tcp"
    source_port_range          = "*"
    destination_port_range     = "22"
    source_address_prefix      = "*"
    destination_address_prefix = "*"
  }

  security_rule {
    name                       = "Allow-Frontend"
    priority                   = 110
    direction                  = "Inbound"
    access                     = "Allow"
    protocol                   = "Tcp"
    source_port_range          = "*"
    destination_port_range     = "5173"
    source_address_prefix      = "*"
    destination_address_prefix = "*"
  }

  security_rule {
    name                       = "Allow-Backend"
    priority                   = 120
    direction                  = "Inbound"
    access                     = "Allow"
    protocol                   = "Tcp"
    source_port_range          = "*"
    destination_port_range     = "8000"
    source_address_prefix      = "*"
    destination_address_prefix = "*"
  }
}

resource "azurerm_network_interface" "aida_nic" {
  name                = "aida-nic"
  location            = azurerm_resource_group.aida_rg.location
  resource_group_name = azurerm_resource_group.aida_rg.name

  ip_configuration {
    name                          = "internal"
    subnet_id                     = azurerm_subnet.aida_subnet.id
    private_ip_address_allocation = "Dynamic"
    public_ip_address_id          = azurerm_public_ip.aida_ip.id
  }
}

resource "azurerm_network_interface_security_group_association" "aida_nic_nsg" {
  network_interface_id      = azurerm_network_interface.aida_nic.id
  network_security_group_id = azurerm_network_security_group.aida_nsg.id
}

resource "azurerm_linux_virtual_machine" "aida_vm" {
  name                = "aida-vm"
  resource_group_name = azurerm_resource_group.aida_rg.name
  location            = azurerm_resource_group.aida_rg.location
  size                = "Standard_B2ats_v2"
  admin_username      = "azureuser"

  network_interface_ids = [
    azurerm_network_interface.aida_nic.id
  ]

  admin_ssh_key {
    username   = "azureuser"
    public_key = file("~/.ssh/aida-terraform-key.pub")
  }

  os_disk {
    caching              = "ReadWrite"
    storage_account_type = "StandardSSD_LRS"
  }

  source_image_reference {
    publisher = "Canonical"
    offer     = "ubuntu-24_04-lts"
    sku       = "server"
    version   = "latest"
  }
}