﻿CREATE PROCEDURE [dbo].[spSupplier_GetById]
	@Id int
AS
BEGIN
	set nocount on;

	SELECT [Id], [AccountNumber], [CompanyName], [ContactName], [EmailAddress], [Address], [PhoneNumber], [Country], [City]
    FROM Supplier
	WHERE Id = @Id and Active = 1;
END
