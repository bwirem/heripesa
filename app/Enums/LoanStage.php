<?php

namespace App\Enums;

    enum LoanStage: int
    {
        case Draft = 1;
        case Documentation = 2;  
        case LoanOfficerReview = 3;
        case ManagerReview = 4;
        case CommitteeReview = 5;
        case Approved = 6;
        case Disbursed = 7;
        case Rejected = 8;
        case Repaid = 9;
        case Defaulted = 10;    
    



        public static function getLabel(int $value): string
        {
            return match ($value) {
                self::Draft->value => 'Draft',            
                self::Documentation->value => 'Documentation',            
                self::LoanOfficerReview->value => 'Loan Officer Review',
                self::ManagerReview->value => 'Manager Review',
                self::CommitteeReview->value => 'Committee Review',
                self::Approved->value => 'Approved',            
                self::Disbursed->value => 'Disbursed',
                self::Rejected->value => 'Rejected',
                self::Repaid->value => 'Repaid',
                self::Defaulted->value => 'Defaulted',  
                default => 'Unknown',
            };
        }
    }
