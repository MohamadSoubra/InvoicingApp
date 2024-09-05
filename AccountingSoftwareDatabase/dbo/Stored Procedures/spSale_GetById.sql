﻿CREATE PROCEDURE [dbo].[spSale_GetById]
	@Id int
AS
begin
	set nocount on;

	select Id, CashierId, InvoiceID, SaleDate, SubTotal, Tax, Total
	from dbo.Sale
	Where Id = @Id and Active = 1;
end

