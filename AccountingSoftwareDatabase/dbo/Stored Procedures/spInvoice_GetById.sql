﻿CREATE PROCEDURE [dbo].[spInvoice_GetById]
	@Id int
AS
begin
	set nocount on;

	SELECT Id, InvoiceNumber, ClientId, [Description], InvoiceDate, PaymentDueDate, AmountDue, [Status]
	FROM Invoice
	WHERE Id = @Id 
end