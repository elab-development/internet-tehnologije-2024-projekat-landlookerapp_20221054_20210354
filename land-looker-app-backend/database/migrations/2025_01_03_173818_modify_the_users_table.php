<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::table('users', function (Blueprint $table) {

            $table->dropColumn(['email_verified_at', 'created_at', 'updated_at']);

            $table->string('phone_number')->nullable();
            $table->string('address')->nullable();
            $table->enum('user_type', ['buyer', 'seller'])->default('buyer');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('users', function (Blueprint $table) {

            $table->timestamp('email_verified_at')->nullable();
            $table->timestamps();

            $table->dropColumn(['phone_number', 'address', 'user_type']);
        });
    }
};
