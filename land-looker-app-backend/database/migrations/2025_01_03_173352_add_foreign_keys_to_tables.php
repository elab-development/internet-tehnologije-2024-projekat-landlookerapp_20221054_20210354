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
        Schema::table('tables', function (Blueprint $table) {

            Schema::table('bookings', function (Blueprint $table) {
                $table->unsignedBigInteger('property_id')->nullable();
                $table->unsignedBigInteger('buyer_id')->nullable();
                $table->unsignedBigInteger('worker_id')->nullable();
    
                $table->foreign('property_id')->references('id')->on('properties')->onDelete('cascade');
                $table->foreign('buyer_id')->references('id')->on('users')->onDelete('cascade');
                $table->foreign('worker_id')->references('id')->on('users')->onDelete('cascade');
            });

            Schema::table('properties', function (Blueprint $table) {
                $table->unsignedBigInteger('location_id')->nullable();
    
                $table->foreign('location_id')->references('id')->on('locations')->onDelete('cascade');
            });

        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('tables', function (Blueprint $table) {

            Schema::table('bookings', function (Blueprint $table) {
                $table->dropForeign(['property_id']);
                $table->dropForeign(['buyer_id']);
                $table->dropForeign(['worker_id']);

                $table->dropColumn(['property_id', 'buyer_id', 'worker_id']);
            });

            Schema::table('properties', function (Blueprint $table) {
                $table->dropForeign(['location_id']);
                $table->dropColumn('location_id');
            });
        });
    }
};
