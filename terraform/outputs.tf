output "public_ip_address" {
  value = azurerm_public_ip.aida_ip.ip_address
}

output "vm_name" {
  value = azurerm_linux_virtual_machine.aida_vm.name
}