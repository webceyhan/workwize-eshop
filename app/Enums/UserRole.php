<?php

namespace App\Enums;

enum UserRole: string
{
    case Admin = 'admin';

    case Supplier = 'supplier';

    case Customer = 'customer';
}
